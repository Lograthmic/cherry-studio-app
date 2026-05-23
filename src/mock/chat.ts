import {
  type BranchMessagesResponse,
  type CherryMessagePart,
  type Message,
} from '@/data/types/message';
import type { Topic } from '@/data/types/topic';

const baseDateMs = Date.parse('2026-05-15T00:00:00.000Z');
const mockAssistantId = 'mock-assistant-default';

type BenchmarkMessageKind = 'complex' | 'latex' | 'text';

type BenchmarkTopicSeed = {
  id: string;
  kind: BenchmarkMessageKind;
  messageCount: number;
  name: string;
  orderKey: string;
};

export const mockBenchmarkTopicIdPrefix = 'mock-benchmark-topic-';
export const mockBenchmarkMessageIdPrefix = 'mock-benchmark-message-';

const benchmarkTopicSeeds = [
  createBenchmarkTopicSeed('text', 5, 'a0'),
  createBenchmarkTopicSeed('text', 10, 'a1'),
  createBenchmarkTopicSeed('text', 100, 'a2'),
  createBenchmarkTopicSeed('latex', 5, 'a3'),
  createBenchmarkTopicSeed('latex', 10, 'a4'),
  createBenchmarkTopicSeed('latex', 100, 'a5'),
  createBenchmarkTopicSeed('complex', 5, 'a6'),
  createBenchmarkTopicSeed('complex', 10, 'a7'),
  createBenchmarkTopicSeed('complex', 100, 'a8'),
] satisfies readonly BenchmarkTopicSeed[];

function createBenchmarkTopicSeed(
  kind: BenchmarkMessageKind,
  messageCount: number,
  orderKey: string,
): BenchmarkTopicSeed {
  return {
    id: `${mockBenchmarkTopicIdPrefix}${kind}-${messageCount}`,
    kind,
    messageCount,
    name: `${getBenchmarkKindName(kind)} ${messageCount}`,
    orderKey,
  };
}

function getBenchmarkKindName(kind: BenchmarkMessageKind) {
  switch (kind) {
    case 'complex':
      return 'Benchmark Complex';
    case 'latex':
      return 'Benchmark LaTeX';
    case 'text':
      return 'Benchmark Plain Text';
  }
}

function isoAt(offsetMs: number) {
  return new Date(baseDateMs + offsetMs).toISOString();
}

function createTextPart(content: string): CherryMessagePart {
  return {
    state: 'done',
    text: content,
    type: 'text',
  };
}

function createBenchmarkMessageContent(seed: BenchmarkTopicSeed, messageNumber: number) {
  switch (seed.kind) {
    case 'complex':
      return createComplexMessageContent(seed, messageNumber);
    case 'latex':
      return createLatexMessageContent(seed, messageNumber);
    case 'text':
      return createPlainTextMessageContent(seed, messageNumber);
  }
}

function createPlainTextMessageContent(seed: BenchmarkTopicSeed, messageNumber: number) {
  return [
    `${seed.name} message ${messageNumber} of ${seed.messageCount}.`,
    '',
    'This fixture intentionally avoids Markdown syntax, LaTeX, tables, lists, and code blocks.',
    'It is used as the control group for measuring the cost of ordinary wrapped text.',
    'The content is deterministic so repeated topic switches can be compared across app launches.',
  ].join('\n');
}

function createLatexMessageContent(seed: BenchmarkTopicSeed, messageNumber: number) {
  const n = messageNumber;

  return [
    `# ${seed.name} message ${messageNumber}`,
    '',
    `Inline math sample: $loss_${n} = \\frac{1}{m}\\sum_{i=1}^{m}(y_i - \\hat{y}_i)^2$.`,
    '',
    '$$',
    `\\begin{aligned}`,
    `A_${n} &= \\sum_{k=1}^{${n + 3}} \\frac{k^2 + ${n}}{k + 1} \\\\`,
    `B_${n} &= \\int_0^1 x^{${(n % 5) + 2}}(1-x)^${(n % 4) + 1}\\,dx \\\\`,
    `C_${n} &= \\sqrt{A_${n}^2 + B_${n}^2}`,
    `\\end{aligned}`,
    '$$',
    '',
    `Display equation: $$p(x \\mid \\theta_${n}) = \\prod_{i=1}^{m} \\theta_${n}^{x_i}(1-\\theta_${n})^{1-x_i}$$`,
  ].join('\n');
}

function createComplexMessageContent(seed: BenchmarkTopicSeed, messageNumber: number) {
  return [
    `## ${seed.name} message ${messageNumber}`,
    '',
    'This fixture combines long prose, nested lists, tables, fenced code, inline math, and display math.',
    'It is the stress group for the Stable Renderer and the Message list initial paint path.',
    '',
    '- Rendering concerns',
    '  - paragraphs should wrap consistently',
    '  - list markers should align after recycling',
    '  - inline `code` and $x^2 + y^2 = z^2$ should not shift row height later',
    '',
    '| Area | Expected behavior |',
    '| --- | --- |',
    '| Text | wraps without clipping |',
    '| Table | keeps borders and cell padding stable |',
    '| Code | uses a stable background and monospace metrics |',
    '| Math | renders inline and display equations |',
    '',
    '```ts',
    `const sample = { topic: "${seed.kind}", messageNumber: ${messageNumber} };`,
    'const visible = sample.messageNumber % 2 === 0 ? "even" : "odd";',
    'expect(visible).toMatch(/even|odd/);',
    '```',
    '',
    '$$',
    `renderCost_${messageNumber} = markdownBlocks \\times parserCost + layoutPasses`,
    '$$',
    '',
    `Trace: ${seed.id}:${messageNumber}`,
  ].join('\n');
}

function createMessage({
  content,
  id,
  messageIndex,
  parentId,
  role,
  topicId,
  topicIndex,
}: {
  content: string;
  id: string;
  messageIndex: number;
  parentId: string | null;
  role: Message['role'];
  topicId: string;
  topicIndex: number;
}): Message {
  const timestamp = isoAt(topicIndex * 10_000_000 + messageIndex * 60_000);

  return {
    createdAt: timestamp,
    data: {
      parts: [createTextPart(content)],
    },
    id,
    parentId,
    role,
    searchableText: content,
    siblingsGroupId: 0,
    status: 'success',
    topicId,
    updatedAt: timestamp,
  };
}

function createMockMessagesForTopic(seed: BenchmarkTopicSeed, topicIndex: number): Message[] {
  const messages: Message[] = [];
  let parentId: string | null = null;

  for (let messageIndex = 0; messageIndex < seed.messageCount; messageIndex += 1) {
    const messageNumber = messageIndex + 1;
    const role: Message['role'] = messageIndex % 2 === 0 ? 'user' : 'assistant';
    const id = `${mockBenchmarkMessageIdPrefix}${seed.kind}-${seed.messageCount}-${messageNumber}`;
    const content = createBenchmarkMessageContent(seed, messageNumber);

    messages.push(
      createMessage({
        content,
        id,
        messageIndex,
        parentId,
        role,
        topicId: seed.id,
        topicIndex,
      }),
    );

    parentId = id;
  }

  return messages;
}

export const mockMessagesByTopicId: Record<string, Message[]> = benchmarkTopicSeeds.reduce(
  (messagesByTopicId, seed, topicIndex) => {
    messagesByTopicId[seed.id] = createMockMessagesForTopic(seed, topicIndex);
    return messagesByTopicId;
  },
  {} as Record<string, Message[]>,
);

export const mockTopics: Topic[] = benchmarkTopicSeeds.map((seed, topicIndex) => {
  const messages = mockMessagesByTopicId[seed.id] ?? [];
  const lastMessage = messages[messages.length - 1];
  const createdAt = isoAt(topicIndex * 10_000_000);

  return {
    ...(lastMessage?.id ? { activeNodeId: lastMessage.id } : {}),
    assistantId: mockAssistantId,
    createdAt,
    id: seed.id,
    isNameManuallyEdited: true,
    name: seed.name,
    orderKey: seed.orderKey,
    updatedAt: lastMessage?.updatedAt ?? createdAt,
  };
});

export const mockTopicMessages = mockTopics.map((topic) => ({
  messages: mockMessagesByTopicId[topic.id] ?? [],
  topic,
}));

export const activeMockTopic = mockTopics[0];
export const demoChatMessages = activeMockTopic
  ? (mockMessagesByTopicId[activeMockTopic.id] ?? [])
  : [];

export function getMockMessagesForTopic(topicId: string) {
  return mockMessagesByTopicId[topicId] ?? [];
}

export type GetMockBranchMessagesParams = {
  cursor?: string;
  limit?: number;
  topicId: string;
};

export function getMockBranchMessages({
  cursor,
  limit = 20,
  topicId,
}: GetMockBranchMessagesParams): BranchMessagesResponse {
  const messages = getMockMessagesForTopic(topicId);
  const topic = mockTopics.find((item) => item.id === topicId);

  if (messages.length === 0 || limit <= 0) {
    return {
      activeNodeId: topic?.activeNodeId ?? null,
      assistantId: topic?.assistantId ?? null,
      items: [],
    };
  }

  const cursorIndex =
    typeof cursor === 'string' ? messages.findIndex((message) => message.id === cursor) : -1;
  const endIndex = cursorIndex >= 0 ? cursorIndex : messages.length;
  const startIndex = Math.max(0, endIndex - limit);
  const page = messages.slice(startIndex, endIndex);

  return {
    activeNodeId: topic?.activeNodeId ?? null,
    assistantId: topic?.assistantId ?? null,
    items: page.map((message) => ({ message })),
    nextCursor: startIndex > 0 ? page[0]?.id : undefined,
  };
}
