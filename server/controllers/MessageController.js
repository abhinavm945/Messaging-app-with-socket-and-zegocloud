import { type } from "os";
import getPrismaInstance from "../utils/PrismaClient.js";
import { renameSync } from "fs";

// Add a new message
export const addMessage = async (req, res, next) => {
  try {
    console.log("Request body:", req.body); // Debugging line
    const prisma = getPrismaInstance();
    const { message, from, to } = req.body;

    if (!message || !from || !to) {
      return res.status(400).send("From, to, and message are required");
    }

    const getUser = global.onlineUsers?.get(to); // Access the global online users map safely

    // Create a new message
    const newMessage = await prisma.messages.create({
      data: {
        message,
        sender: { connect: { id: parseInt(from) } },
        reciever: { connect: { id: parseInt(to) } },
        messageStatus: getUser ? "delivered" : "sent",
      },
      include: { sender: true, reciever: true },
    });

    console.log("Message created successfully:", newMessage); // Debugging line
    return res.status(201).send({ message: newMessage });
  } catch (err) {
    console.error("Error in addMessage:", err); // Debugging line
    res.status(500).send(`Error: ${err.message}`);
    next(err);
  }
};

// Get all messages between two users
export const getMessages = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();
    const { from, to } = req.params;

    // Fetch messages between two users
    const messages = await prisma.messages.findMany({
      where: {
        OR: [
          {
            senderId: parseInt(from),
            recieverId: parseInt(to),
          },
          {
            senderId: parseInt(to),
            recieverId: parseInt(from),
          },
        ],
      },
      orderBy: {
        id: "asc", // Sort messages by ascending order of their id (timestamp)
      },
    });

    const unreadMessages = [];

    // Check messages where the current user is the recipient and the message hasn't been marked as "read"
    messages.forEach((message, index) => {
      if (
        message.messageStatus !== "read" &&
        message.senderId === parseInt(to) // Current user is the recipient
      ) {
        // Mark message as "read"
        messages[index].messageStatus = "read";
        unreadMessages.push(message.id); // Collect the message ids to update
      }
    });
    await prisma.messages.updateMany({
      where: { id: { in: unreadMessages } },
      data: { messageStatus: "read" },
    });

    res.status(200).json({ messages });
  } catch (err) {
    next(err);
  }
};

export const addImageMessage = async (req, res, next) => {
  try {
    if (req.file) {
      const date = Date.now();
      let fileName = "uploads/images/" + date + req.file.originalname;
      renameSync(req.file.path, fileName);
      const prisma = getPrismaInstance();
      78;
      const { from, to } = req.query;

      if (from && to) {
        const message = await prisma.messages.create({
          data: {
            message: fileName,
            sender: { connect: { id: parseInt(from) } }, // Connect the sender by id
            reciever: { connect: { id: parseInt(to) } }, // Connect the reciever by id
            type: "image",
          },
        });
        return res.status(201).json({ message });
      }
      return res.status(400).send("From,to is required");
    }
    return res.status(400).send("Image is required");
  } catch (err) {
    next(err);
  }
};

export const addAudioMessage = async (req, res, next) => {
  try {
    if (req.file) {
      const date = Date.now();
      let fileName = "uploads/recordings/" + date + req.file.originalname;
      renameSync(req.file.path, fileName);
      const prisma = getPrismaInstance();
      78;
      const { from, to } = req.query;

      if (from && to) {
        const message = await prisma.messages.create({
          data: {
            message: fileName,
            sender: { connect: { id: parseInt(from) } }, // Connect the sender by id
            reciever: { connect: { id: parseInt(to) } }, // Connect the reciever by id
            type: "audio",
          },
        });
        return res.status(201).json({ message });
      }
      return res.status(400).send("From,to is required");
    }
    return res.status(400).send("Audio is required");
  } catch (err) {
    next(err);
  }
};

export const getInitialContactswithMessages = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.from);
    const prisma = getPrismaInstance();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        sentMessages: {
          include: {
            reciever: true,
            sender: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        recievedMessages: {
          include: {
            reciever: true,
            sender: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    const messages = [...user.sentMessages, ...user.recievedMessages];
    messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const users = new Map();
    const messagesStatusChange = [];

    messages.forEach((msg) => {
      const isSender = msg.senderId === userId;
      const calculatedId = isSender ? msg.recieverId : msg.senderId;

      if (msg.messageStatus === "sent") {
        messagesStatusChange.push(msg.id);
      }

      const {
        id,
        type,
        message,
        messageStatus,
        createdAt,
        senderId,
        recieverId,
      } = msg;

      if (!users.get(calculatedId)) {
        let user = {
          messageId: id,
          type,
          message,
          messageStatus,
          createdAt,
          senderId,
          recieverId,
        };

        if (isSender) {
          user = {
            ...user,
            ...msg.reciever,
            totalUnreadMessages: 0,
          };
        } else {
          user = {
            ...user,
            ...msg.sender,
            totalUnreadMessages: messageStatus !== "read" ? 1 : 0,
          };
        }

        users.set(calculatedId, { ...user });
      } else if (messageStatus !== "read" && !isSender) {
        const contact = users.get(calculatedId);
        users.set(calculatedId, {
          ...user,
          totalUnreadMessages: user.totalUnreadMessages + 1,
        });
      }
    });

    if (messagesStatusChange.length) {
      await prisma.messages.updateMany({
        where: { id: { in: messagesStatusChange } },
        data: { messageStatus: "delivered" },
      });
    }

    return res.status(200).json({
      users: Array.from(users.values()),
      onlineUsers: Array.from(onlineUsers.keys()),
    });
  } catch (err) {
    next(err);
  }
};
