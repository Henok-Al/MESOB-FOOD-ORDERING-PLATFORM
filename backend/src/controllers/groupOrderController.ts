import { Request, Response } from 'express';
import GroupOrder from '../models/GroupOrder';
import { generateUniqueId } from '../utils/helpers';

// @desc    Create a new group order
// @route   POST /api/group-orders
// @access  Private
export const createGroupOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const {
      restaurantId,
      name,
      description,
      deadline,
      maxParticipants,
      isPublic,
      settings,
    } = req.body;

    const groupOrderId = generateUniqueId(8);
    const shareLink = `${process.env.FRONTEND_URL}/group-order/${groupOrderId}`;

    const groupOrder = await GroupOrder.create({
      host: userId,
      restaurant: restaurantId,
      groupOrderId,
      name,
      description,
      deadline: deadline ? new Date(deadline) : undefined,
      maxParticipants,
      isPublic: isPublic || false,
      shareLink,
      settings: settings || {
        allowLateJoin: true,
        splitBillEqually: false,
        hostPaysAll: false,
      },
      participants: [
        {
          user: userId,
          name: (req as any).user.name,
          items: [],
          subtotal: 0,
          status: 'ordering',
        },
      ],
    });

    res.status(201).json({
      status: 'success',
      data: { groupOrder },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Get group order by ID
// @route   GET /api/group-orders/:groupOrderId
// @access  Private
export const getGroupOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupOrderId } = req.params;

    const groupOrder = await GroupOrder.findOne({ groupOrderId })
      .populate('host', 'name email')
      .populate('restaurant', 'name image cuisine')
      .populate('participants.user', 'name avatar')
      .populate('items.product', 'name image');

    if (!groupOrder) {
      res.status(404).json({ status: 'fail', message: 'Group order not found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: { groupOrder },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Join a group order
// @route   POST /api/group-orders/:groupOrderId/join
// @access  Private
export const joinGroupOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const { groupOrderId } = req.params;
    const { name } = req.body;

    const groupOrder = await GroupOrder.findOne({ groupOrderId });

    if (!groupOrder) {
      res.status(404).json({ status: 'fail', message: 'Group order not found' });
      return;
    }

    // Check if user is already a participant
    const existingParticipant = groupOrder.participants.find(
      (p) => p.user.toString() === userId.toString()
    );
    if (existingParticipant) {
      res.status(400).json({ status: 'fail', message: 'You have already joined this group order' });
      return;
    }

    // Check if max participants reached
    if (groupOrder.maxParticipants && groupOrder.participants.length >= groupOrder.maxParticipants) {
      res.status(400).json({ status: 'fail', message: 'Group order is full' });
      return;
    }

    // Check if deadline has passed
    if (groupOrder.deadline && new Date() > groupOrder.deadline && !groupOrder.settings.allowLateJoin) {
      res.status(400).json({ status: 'fail', message: 'Group order deadline has passed' });
      return;
    }

    groupOrder.participants.push({
      user: userId,
      name: name || (req as any).user.name,
      items: [],
      subtotal: 0,
      status: 'ordering',
      joinedAt: new Date(),
    });

    await groupOrder.save();

    res.status(200).json({
      status: 'success',
      data: { groupOrder },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Add item to group order
// @route   POST /api/group-orders/:groupOrderId/items
// @access  Private
export const addItemToGroupOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const { groupOrderId } = req.params;
    const { productId, name, price, quantity, specialInstructions } = req.body;

    const groupOrder = await GroupOrder.findOne({ groupOrderId });

    if (!groupOrder) {
      res.status(404).json({ status: 'fail', message: 'Group order not found' });
      return;
    }

    // Check if user is a participant
    const participant = groupOrder.participants.find(
      (p) => p.user.toString() === userId.toString()
    );
    if (!participant) {
      res.status(403).json({ status: 'fail', message: 'You are not a participant in this group order' });
      return;
    }

    // Add item to group order
    const newItem = {
      product: productId,
      participant: userId,
      name,
      price,
      quantity,
      specialInstructions,
    };

    groupOrder.items.push(newItem);

    // Add item to participant's items
    participant.items.push({
      product: productId,
      name,
      price,
      quantity,
      specialInstructions,
    });

    // Recalculate totals
    groupOrder.calculateTotals();

    await groupOrder.save();

    res.status(200).json({
      status: 'success',
      data: { groupOrder, item: newItem },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Remove item from group order
// @route   DELETE /api/group-orders/:groupOrderId/items/:itemId
// @access  Private
export const removeItemFromGroupOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const { groupOrderId, itemId } = req.params;

    const groupOrder = await GroupOrder.findOne({ groupOrderId });

    if (!groupOrder) {
      res.status(404).json({ status: 'fail', message: 'Group order not found' });
      return;
    }

    // Find the item
    const itemIndex = groupOrder.items.findIndex(
      (item) => item._id.toString() === itemId && item.participant.toString() === userId.toString()
    );

    if (itemIndex === -1) {
      res.status(404).json({ status: 'fail', message: 'Item not found or you do not have permission' });
      return;
    }

    // Remove item
    groupOrder.items.splice(itemIndex, 1);

    // Remove from participant's items
    const participant = groupOrder.participants.find(
      (p) => p.user.toString() === userId.toString()
    );
    if (participant) {
      const participantItemIndex = participant.items.findIndex(
        (item) => item.product.toString() === groupOrder.items[itemIndex]?.product.toString()
      );
      if (participantItemIndex > -1) {
        participant.items.splice(participantItemIndex, 1);
      }
    }

    // Recalculate totals
    groupOrder.calculateTotals();

    await groupOrder.save();

    res.status(200).json({
      status: 'success',
      data: { groupOrder },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Mark participant as ready
// @route   POST /api/group-orders/:groupOrderId/ready
// @access  Private
export const markReady = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const { groupOrderId } = req.params;

    const groupOrder = await GroupOrder.findOne({ groupOrderId });

    if (!groupOrder) {
      res.status(404).json({ status: 'fail', message: 'Group order not found' });
      return;
    }

    const participant = groupOrder.participants.find(
      (p) => p.user.toString() === userId.toString()
    );
    if (!participant) {
      res.status(403).json({ status: 'fail', message: 'You are not a participant' });
      return;
    }

    participant.status = 'ready';
    await groupOrder.save();

    res.status(200).json({
      status: 'success',
      data: { groupOrder },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Finalize and place group order
// @route   POST /api/group-orders/:groupOrderId/place
// @access  Private
export const placeGroupOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const { groupOrderId } = req.params;
    const { deliveryAddress, paymentMethod } = req.body;

    const groupOrder = await GroupOrder.findOne({ groupOrderId });

    if (!groupOrder) {
      res.status(404).json({ status: 'fail', message: 'Group order not found' });
      return;
    }

    // Only host can place the order
    if (groupOrder.host.toString() !== userId.toString()) {
      res.status(403).json({ status: 'fail', message: 'Only the host can place the order' });
      return;
    }

    // Check if all participants are ready
    const notReady = groupOrder.participants.filter((p) => p.status !== 'ready');
    if (notReady.length > 0) {
      res.status(400).json({
        status: 'fail',
        message: 'All participants must mark ready before placing order',
      });
      return;
    }

    // Check if there are items
    if (groupOrder.items.length === 0) {
      res.status(400).json({ status: 'fail', message: 'Cannot place empty order' });
      return;
    }

    // Update status
    groupOrder.status = 'placed';
    await groupOrder.save();

    // In a real app, create actual Order here and process payment

    res.status(200).json({
      status: 'success',
      message: 'Group order placed successfully',
      data: { groupOrder },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Get user's group orders
// @route   GET /api/group-orders/my-orders
// @access  Private
export const getMyGroupOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const { status } = req.query;

    const query: any = {
      $or: [{ host: userId }, { 'participants.user': userId }],
    };
    if (status) query.status = status;

    const groupOrders = await GroupOrder.find(query)
      .populate('restaurant', 'name image')
      .populate('host', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: groupOrders.length,
      data: { groupOrders },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Cancel group order
// @route   DELETE /api/group-orders/:groupOrderId
// @access  Private
export const cancelGroupOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const { groupOrderId } = req.params;

    const groupOrder = await GroupOrder.findOne({ groupOrderId });

    if (!groupOrder) {
      res.status(404).json({ status: 'fail', message: 'Group order not found' });
      return;
    }

    // Only host can cancel
    if (groupOrder.host.toString() !== userId.toString()) {
      res.status(403).json({ status: 'fail', message: 'Only host can cancel' });
      return;
    }

    if (groupOrder.status === 'placed') {
      res.status(400).json({ status: 'fail', message: 'Cannot cancel placed order' });
      return;
    }

    groupOrder.status = 'cancelled';
    await groupOrder.save();

    res.status(200).json({
      status: 'success',
      message: 'Group order cancelled',
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};
