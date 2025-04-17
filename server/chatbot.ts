import {
  chatbotFlows, ChatbotFlow, InsertChatbotFlow,
  chatbotNodes, ChatbotNode, InsertChatbotNode,
  chatbotConditions, ChatbotCondition, InsertChatbotCondition,
  chatbotActions, ChatbotAction, InsertChatbotAction,
  chatbotSessions, ChatbotSession, InsertChatbotSession,
  cannedResponses, CannedResponse, InsertCannedResponse,
  whatsappChats, whatsappMessages
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { storage } from "./storage";

// Chatbot Flow Operations
export async function getChatbotFlows(): Promise<ChatbotFlow[]> {
  try {
    return await storage.getChatbotFlows();
  } catch (error) {
    console.error("Error getting chatbot flows:", error);
    return [];
  }
}

export async function getChatbotFlowsByConsultant(consultantId: number): Promise<ChatbotFlow[]> {
  try {
    return await storage.getChatbotFlowsByConsultant(consultantId);
  } catch (error) {
    console.error(`Error getting chatbot flows for consultant ${consultantId}:`, error);
    return [];
  }
}

export async function getChatbotFlow(id: number): Promise<ChatbotFlow | undefined> {
  try {
    return await storage.getChatbotFlow(id);
  } catch (error) {
    console.error(`Error getting chatbot flow ${id}:`, error);
    return undefined;
  }
}

export async function getChatbotFlowByKeyword(keyword: string): Promise<ChatbotFlow | undefined> {
  try {
    return await storage.getChatbotFlowByKeyword(keyword);
  } catch (error) {
    console.error(`Error getting chatbot flow by keyword ${keyword}:`, error);
    return undefined;
  }
}

export async function getDefaultChatbotFlow(): Promise<ChatbotFlow | undefined> {
  try {
    return await storage.getDefaultChatbotFlow();
  } catch (error) {
    console.error("Error getting default chatbot flow:", error);
    return undefined;
  }
}

export async function createChatbotFlow(flow: InsertChatbotFlow): Promise<ChatbotFlow | undefined> {
  try {
    return await storage.createChatbotFlow(flow);
  } catch (error) {
    console.error("Error creating chatbot flow:", error);
    return undefined;
  }
}

export async function updateChatbotFlow(id: number, flow: Partial<ChatbotFlow>): Promise<ChatbotFlow | undefined> {
  try {
    return await storage.updateChatbotFlow(id, flow);
  } catch (error) {
    console.error(`Error updating chatbot flow ${id}:`, error);
    return undefined;
  }
}

export async function deleteChatbotFlow(id: number): Promise<boolean> {
  try {
    return await storage.deleteChatbotFlow(id);
  } catch (error) {
    console.error(`Error deleting chatbot flow ${id}:`, error);
    return false;
  }
}

// Chatbot Node Operations
export async function getChatbotNodes(flowId: number): Promise<ChatbotNode[]> {
  try {
    return await storage.getChatbotNodes(flowId);
  } catch (error) {
    console.error(`Error getting chatbot nodes for flow ${flowId}:`, error);
    return [];
  }
}

export async function getChatbotNode(id: number): Promise<ChatbotNode | undefined> {
  try {
    return await storage.getChatbotNode(id);
  } catch (error) {
    console.error(`Error getting chatbot node ${id}:`, error);
    return undefined;
  }
}

export async function createChatbotNode(node: InsertChatbotNode): Promise<ChatbotNode | undefined> {
  try {
    return await storage.createChatbotNode(node);
  } catch (error) {
    console.error("Error creating chatbot node:", error);
    return undefined;
  }
}

export async function updateChatbotNode(id: number, node: Partial<ChatbotNode>): Promise<ChatbotNode | undefined> {
  try {
    return await storage.updateChatbotNode(id, node);
  } catch (error) {
    console.error(`Error updating chatbot node ${id}:`, error);
    return undefined;
  }
}

export async function deleteChatbotNode(id: number): Promise<boolean> {
  try {
    return await storage.deleteChatbotNode(id);
  } catch (error) {
    console.error(`Error deleting chatbot node ${id}:`, error);
    return false;
  }
}

// Chatbot Condition Operations
export async function getChatbotConditionsByNode(nodeId: number): Promise<ChatbotCondition[]> {
  try {
    return await storage.getChatbotConditionsByNode(nodeId);
  } catch (error) {
    console.error(`Error getting chatbot conditions for node ${nodeId}:`, error);
    return [];
  }
}

export async function createChatbotCondition(condition: InsertChatbotCondition): Promise<ChatbotCondition | undefined> {
  try {
    return await storage.createChatbotCondition(condition);
  } catch (error) {
    console.error("Error creating chatbot condition:", error);
    return undefined;
  }
}

export async function updateChatbotCondition(id: number, condition: Partial<ChatbotCondition>): Promise<ChatbotCondition | undefined> {
  try {
    return await storage.updateChatbotCondition(id, condition);
  } catch (error) {
    console.error(`Error updating chatbot condition ${id}:`, error);
    return undefined;
  }
}

export async function deleteChatbotCondition(id: number): Promise<boolean> {
  try {
    return await storage.deleteChatbotCondition(id);
  } catch (error) {
    console.error(`Error deleting chatbot condition ${id}:`, error);
    return false;
  }
}

// Chatbot Action Operations
export async function getChatbotActionsByNode(nodeId: number): Promise<ChatbotAction[]> {
  try {
    return await storage.getChatbotActionsByNode(nodeId);
  } catch (error) {
    console.error(`Error getting chatbot actions for node ${nodeId}:`, error);
    return [];
  }
}

export async function createChatbotAction(action: InsertChatbotAction): Promise<ChatbotAction | undefined> {
  try {
    return await storage.createChatbotAction(action);
  } catch (error) {
    console.error("Error creating chatbot action:", error);
    return undefined;
  }
}

export async function updateChatbotAction(id: number, action: Partial<ChatbotAction>): Promise<ChatbotAction | undefined> {
  try {
    return await storage.updateChatbotAction(id, action);
  } catch (error) {
    console.error(`Error updating chatbot action ${id}:`, error);
    return undefined;
  }
}

export async function deleteChatbotAction(id: number): Promise<boolean> {
  try {
    return await storage.deleteChatbotAction(id);
  } catch (error) {
    console.error(`Error deleting chatbot action ${id}:`, error);
    return false;
  }
}

// Chatbot Session Operations
export async function getChatbotSessions(): Promise<ChatbotSession[]> {
  try {
    return await storage.getChatbotSessions();
  } catch (error) {
    console.error("Error getting chatbot sessions:", error);
    return [];
  }
}

export async function getChatbotSessionsByChat(chatId: number): Promise<ChatbotSession[]> {
  try {
    return await storage.getChatbotSessionsByChat(chatId);
  } catch (error) {
    console.error(`Error getting chatbot sessions for chat ${chatId}:`, error);
    return [];
  }
}

export async function getChatbotActiveSession(chatId: number): Promise<ChatbotSession | undefined> {
  try {
    return await storage.getChatbotActiveSession(chatId);
  } catch (error) {
    console.error(`Error getting active chatbot session for chat ${chatId}:`, error);
    return undefined;
  }
}

export async function createChatbotSession(session: InsertChatbotSession): Promise<ChatbotSession | undefined> {
  try {
    return await storage.createChatbotSession(session);
  } catch (error) {
    console.error("Error creating chatbot session:", error);
    return undefined;
  }
}

export async function updateChatbotSession(id: number, session: Partial<ChatbotSession>): Promise<ChatbotSession | undefined> {
  try {
    return await storage.updateChatbotSession(id, session);
  } catch (error) {
    console.error(`Error updating chatbot session ${id}:`, error);
    return undefined;
  }
}

export async function endChatbotSession(id: number): Promise<ChatbotSession | undefined> {
  try {
    return await storage.endChatbotSession(id);
  } catch (error) {
    console.error(`Error ending chatbot session ${id}:`, error);
    return undefined;
  }
}

// Canned Response Operations
export async function getCannedResponses(): Promise<CannedResponse[]> {
  try {
    return await storage.getCannedResponses();
  } catch (error) {
    console.error("Error getting canned responses:", error);
    return [];
  }
}

export async function getCannedResponsesByConsultant(consultantId: number): Promise<CannedResponse[]> {
  try {
    return await storage.getCannedResponsesByConsultant(consultantId);
  } catch (error) {
    console.error(`Error getting canned responses for consultant ${consultantId}:`, error);
    return [];
  }
}

export async function getCannedResponseByShortcut(shortcut: string, consultantId: number): Promise<CannedResponse | undefined> {
  try {
    return await storage.getCannedResponseByShortcut(shortcut, consultantId);
  } catch (error) {
    console.error(`Error getting canned response by shortcut ${shortcut}:`, error);
    return undefined;
  }
}

export async function createCannedResponse(response: InsertCannedResponse): Promise<CannedResponse | undefined> {
  try {
    return await storage.createCannedResponse(response);
  } catch (error) {
    console.error("Error creating canned response:", error);
    return undefined;
  }
}

export async function updateCannedResponse(id: number, response: Partial<CannedResponse>): Promise<CannedResponse | undefined> {
  try {
    return await storage.updateCannedResponse(id, response);
  } catch (error) {
    console.error(`Error updating canned response ${id}:`, error);
    return undefined;
  }
}

export async function deleteCannedResponse(id: number): Promise<boolean> {
  try {
    return await storage.deleteCannedResponse(id);
  } catch (error) {
    console.error(`Error deleting canned response ${id}:`, error);
    return false;
  }
}

// Chatbot Processing Logic
export async function processIncomingMessage(phoneNumber: string, message: string): Promise<string | undefined> {
  try {
    // Find or create chat
    let chat = await findChatByPhoneNumber(phoneNumber);
    
    if (!chat) {
      // Create a new chat for this phone number
      const lead = await findOrCreateLeadByPhoneNumber(phoneNumber);
      if (!lead) return undefined;
      
      chat = await storage.createWhatsappChat({
        leadId: lead.id,
        phoneNumber,
        lastMessageTime: new Date(),
        unreadCount: 0,
        consultantId: lead.consultantId
      });
    }
    
    // Log the incoming message
    await storage.createWhatsappMessage({
      chatId: chat.id,
      content: message,
      direction: 'incoming',
      status: 'received',
      messageId: null,
      timestamp: new Date()
    });
    
    // Check for active session
    let session = await storage.getChatbotActiveSession(chat.id);
    
    if (session) {
      // Continue existing conversation flow
      return await continueConversationFlow(session, message);
    } else {
      // Start a new conversation flow
      return await startNewConversationFlow(chat.id, message);
    }
  } catch (error) {
    console.error("Error processing incoming message:", error);
    return undefined;
  }
}

async function findChatByPhoneNumber(phoneNumber: string): Promise<any> {
  try {
    // Find a chat by phone number
    const chats = await storage.getWhatsappChats();
    return chats.find(chat => chat.phoneNumber === phoneNumber);
  } catch (error) {
    console.error(`Error finding chat by phone number ${phoneNumber}:`, error);
    return undefined;
  }
}

async function findOrCreateLeadByPhoneNumber(phoneNumber: string): Promise<any> {
  try {
    // Find a lead by phone number or WhatsApp number
    const leads = await storage.getLeads();
    let lead = leads.find(lead => 
      lead.phone === phoneNumber || 
      lead.whatsappNumber === phoneNumber
    );
    
    if (!lead) {
      // Create a new lead for this phone number
      lead = await storage.createLead({
        fullName: "WhatsApp User",
        phone: phoneNumber,
        whatsappNumber: phoneNumber,
        consultantId: 1, // Default consultant ID
        createdBy: 1, // Default creator ID (system)
        status: "New",
        priority: "Medium",
        source: "WhatsApp"
      });
    }
    
    return lead;
  } catch (error) {
    console.error(`Error finding or creating lead by phone number ${phoneNumber}:`, error);
    return undefined;
  }
}

async function startNewConversationFlow(chatId: number, message: string): Promise<string | undefined> {
  try {
    // Check for keyword trigger
    let flow: ChatbotFlow | undefined;
    
    // Check if the message matches any flow trigger keywords
    const flows = await storage.getChatbotFlows();
    for (const f of flows) {
      if (f.isActive && f.triggerKeywords.some(keyword => 
        message.toLowerCase().includes(keyword.toLowerCase())
      )) {
        flow = f;
        break;
      }
    }
    
    // If no specific flow is triggered, use the default flow
    if (!flow) {
      flow = await storage.getDefaultChatbotFlow();
    }
    
    if (!flow) {
      // No flow found, return a generic response
      return "Thank you for your message. A consultant will respond to you shortly.";
    }
    
    // Get the first node of the flow
    const nodes = await storage.getChatbotNodes(flow.id);
    const startNode = nodes.find(node => node.type === 'start' || node.position === 1);
    
    if (!startNode) {
      return "Our chatbot is currently being set up. A consultant will respond to you shortly.";
    }
    
    // Create a new session
    await storage.createChatbotSession({
      chatId,
      flowId: flow.id,
      startNodeId: startNode.id,
      currentNodeId: startNode.id,
      variables: {},
      isActive: true
    });
    
    // Process the start node and return its message
    return startNode.message;
  } catch (error) {
    console.error(`Error starting new conversation flow for chat ${chatId}:`, error);
    return "Sorry, we encountered an error. A consultant will respond to you shortly.";
  }
}

async function continueConversationFlow(session: ChatbotSession, message: string): Promise<string | undefined> {
  try {
    // Get the current node
    const currentNode = await storage.getChatbotNode(session.currentNodeId);
    if (!currentNode) {
      return "Sorry, we encountered an error. A consultant will respond to you shortly.";
    }
    
    // Check if current node has conditions
    const conditions = await storage.getChatbotConditionsByNode(currentNode.id);
    let nextNodeId: number | undefined;
    
    // Process conditions to determine next node
    for (const condition of conditions) {
      let conditionMet = false;
      
      switch (condition.type) {
        case 'contains':
          conditionMet = message.toLowerCase().includes(condition.value.toLowerCase());
          break;
        case 'equals':
          conditionMet = message.toLowerCase() === condition.value.toLowerCase();
          break;
        case 'regex':
          try {
            const regex = new RegExp(condition.value, 'i');
            conditionMet = regex.test(message);
          } catch (e) {
            console.error(`Invalid regex in condition ${condition.id}:`, e);
          }
          break;
        case 'default':
          conditionMet = true; // Default condition is always met
          break;
      }
      
      if (conditionMet) {
        nextNodeId = condition.nextNodeId;
        break;
      }
    }
    
    // If no conditions or no condition met, check if there's a default path
    if (!nextNodeId) {
      const defaultCondition = conditions.find(c => c.type === 'default');
      if (defaultCondition) {
        nextNodeId = defaultCondition.nextNodeId;
      }
    }
    
    // If still no next node, end the session
    if (!nextNodeId) {
      await storage.endChatbotSession(session.id);
      return "Thank you for chatting with us. A consultant will follow up with you shortly.";
    }
    
    // Get the next node
    const nextNode = await storage.getChatbotNode(nextNodeId);
    if (!nextNode) {
      await storage.endChatbotSession(session.id);
      return "Sorry, we encountered an error. A consultant will respond to you shortly.";
    }
    
    // Update the session with the new current node
    await storage.updateChatbotSession(session.id, {
      currentNodeId: nextNode.id,
      variables: {
        ...session.variables,
        lastMessage: message
      }
    });
    
    // Process and return the message from the next node
    if (nextNode.type === 'end') {
      await storage.endChatbotSession(session.id);
    }
    
    return nextNode.message;
  } catch (error) {
    console.error(`Error continuing conversation flow for session ${session.id}:`, error);
    return "Sorry, we encountered an error. A consultant will respond to you shortly.";
  }
}