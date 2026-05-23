import { type MessageData, MessageDataSchema } from '../message';

describe('MessageDataSchema', () => {
  test('accepts parts-only message data', () => {
    const data: MessageData = {
      parts: [{ state: 'done', text: 'hello parts', type: 'text' }],
    };

    expect(MessageDataSchema.safeParse(data).success).toBe(true);
  });

  test('keeps deprecated blocks optional for Cherry type compatibility', () => {
    expect(MessageDataSchema.safeParse({ blocks: [], parts: [] }).success).toBe(true);
    expect(MessageDataSchema.safeParse({ blocks: {}, parts: [] }).success).toBe(false);
  });
});
