// ─── Auth ────────────────────────────────────────────────────────────────────
export interface LoginPayload {
  email: string
  password: string
}
export interface RegisterPayload {
  email: string
  password: string
  firstName: string
  lastName: string
}
export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

// ─── User ────────────────────────────────────────────────────────────────────
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  status: 'active' | 'inactive' | 'pending' | 'blocked'
  roles: Role[]
  createdAt: string
  updatedAt: string
}

export interface Role {
  id: string
  code: string
  name: string
  description?: string
  isDefault: boolean
  permissions: Permission[]
}

export interface Permission {
  id: string
  name: string
  resource: string
  action: string
}

// ─── Conversation ────────────────────────────────────────────────────────────
export type Platform = 'facebook' | 'telegram' | 'instagram' | 'whatsapp' | 'web'
export type ConversationStatus = 'open' | 'pending' | 'resolved' | 'closed'
export type ConversationPriority = 'urgent' | 'high' | 'normal' | 'low'
export type MessageType = 'text' | 'image' | 'video' | 'file' | 'audio' | 'location' | 'template'
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed'

export interface Conversation {
  id: string
  platform: Platform
  status: ConversationStatus
  priority: ConversationPriority
  contactName?: string
  contactId?: string
  pageId?: string
  externalId?: string
  assignedAgent?: User
  assignedAgentId?: string
  labels?: string[]
  csatScore?: number
  csatComment?: string
  csatSentAt?: string
  handoverMode: boolean
  isArchived: boolean
  messages?: Message[]
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface ConversationNote {
  id: string
  conversationId: string
  authorId?: string
  author?: User
  content: string
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  conversationId: string
  type: MessageType
  content?: string
  mediaUrl?: string
  isFromContact: boolean
  senderId?: string
  status: MessageStatus
  metadata?: Record<string, unknown>
  createdAt: string
}

// ─── Inbox ───────────────────────────────────────────────────────────────────
export interface Inbox {
  id: string
  name: string
  platform: Platform
  pageId?: string
  isActive: boolean
  config?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

// ─── Knowledge ───────────────────────────────────────────────────────────────
export interface KnowledgeBase {
  id: string
  name: string
  description?: string
  isActive: boolean
  items?: KnowledgeItem[]
  createdAt: string
  updatedAt: string
}

export interface KnowledgeItem {
  id: string
  knowledgeBaseId: string
  question: string
  answer: string
  tags?: string[]
  source?: string
  sourceType?: string
  isActive: boolean
  createdAt: string
}

// ─── Prompt ──────────────────────────────────────────────────────────────────
export type PromptCategory = 'system' | 'sales' | 'support' | 'marketing' | 'general'

export interface Prompt {
  id: string
  name: string
  description?: string
  content: string
  category: PromptCategory
  variables?: string[]
  isActive: boolean
  currentVersion: number
  createdAt: string
  updatedAt: string
}

export interface PromptVersion {
  id: string
  promptId: string
  version: number
  content: string
  createdAt: string
}

// ─── Chatbot ─────────────────────────────────────────────────────────────────
export interface Chatbot {
  id: string
  name: string
  description?: string
  isActive: boolean
  knowledgeBaseId?: string
  promptId?: string
  language?: string
  flows: Record<string, unknown>[]
  createdAt: string
  updatedAt: string
}

// ─── Notification ────────────────────────────────────────────────────────────
export type NotificationType =
  'new_conversation' | 'new_message' | 'assigned' | 'resolved' | 'mention'
export type NotificationStatus = 'unread' | 'read'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  body?: string
  status: NotificationStatus
  data?: Record<string, unknown>
  createdAt: string
}

// ─── Business Hours ──────────────────────────────────────────────────────────
export interface BusinessHours {
  id: number
  dayOfWeek: number
  isEnabled: boolean
  startTime: string
  endTime: string
  timezone: string
  updatedAt: string
}

// ─── Routing Rules ───────────────────────────────────────────────────────────
export type RuleConditionField = 'platform' | 'keyword' | 'contactId'
export type RuleConditionOperator = 'equals' | 'contains'
export interface RuleCondition {
  field: RuleConditionField
  operator: RuleConditionOperator
  value: string
}
export interface RoutingRule {
  id: string
  name: string
  priority: number
  isActive: boolean
  conditions: RuleCondition[]
  action: 'assign_agent'
  assignedAgentId?: string
  createdAt: string
  updatedAt: string
}

// ─── Contacts ────────────────────────────────────────────────────────────────
export interface Contact {
  contactId: string
  contactName: string
  platform: Platform
  conversationCount: number
  lastActivity: string
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export interface DashboardStats {
  totalConversations: number
  openConversations: number
  resolvedConversations: number
  totalMessages: number
  totalAgents: number
  csatAverage?: number
}

export interface DailyStats {
  date: string
  conversations: number
  messages: number
}

export interface AgentStat {
  agentId: string
  agentName: string
  totalConversations: number
  resolvedConversations: number
  avgCsat: number | null
}

export interface PlatformCount {
  platform: Platform
  count: string
}

// ─── Pagination ──────────────────────────────────────────────────────────────
export interface PaginatedResult<T> {
  data: T[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  statusCode: number
}
