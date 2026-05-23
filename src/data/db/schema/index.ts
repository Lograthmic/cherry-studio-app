import { appStateTable } from './appState';
import { assistantTable } from './assistant';
import { groupTable } from './group';
import { messageTable } from './message';
import { pinTable } from './pin';
import { preferenceTable } from './preference';
import { topicTable } from './topic';
import { userModelTable } from './userModel';
import { userProviderTable } from './userProvider';

export { appStateTable } from './appState';
export { assistantTable } from './assistant';
export { groupTable } from './group';
export { MESSAGE_FTS_STATEMENTS, messageTable } from './message';
export { pinTable } from './pin';
export { preferenceTable } from './preference';
export { topicTable } from './topic';
export { userModelTable } from './userModel';
export { userProviderTable } from './userProvider';

export const schema = {
  assistantTable,
  appStateTable,
  groupTable,
  messageTable,
  pinTable,
  preferenceTable,
  topicTable,
  userModelTable,
  userProviderTable,
};

export type DatabaseSchema = typeof schema;
