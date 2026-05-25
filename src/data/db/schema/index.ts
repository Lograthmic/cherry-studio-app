import { appStateTable } from './appState';
import { assistantTable } from './assistant';
import { assistantKnowledgeBaseTable, assistantMcpServerTable } from './assistantRelations';
import { groupTable } from './group';
import { messageTable } from './message';
import { pinTable } from './pin';
import { preferenceTable } from './preference';
import { promptTable } from './prompt';
import { entityTagTable, tagTable } from './tagging';
import { topicTable } from './topic';
import { userModelTable } from './userModel';
import { userProviderTable } from './userProvider';

export { appStateTable } from './appState';
export { assistantTable } from './assistant';
export {
  assistantKnowledgeBaseTable,
  assistantMcpServerTable,
} from './assistantRelations';
export { groupTable } from './group';
export { MESSAGE_FTS_STATEMENTS, messageTable } from './message';
export { pinTable } from './pin';
export { preferenceTable } from './preference';
export { promptTable } from './prompt';
export { entityTagTable, tagTable } from './tagging';
export { topicTable } from './topic';
export { userModelTable } from './userModel';
export { userProviderTable } from './userProvider';

export const schema = {
  assistantKnowledgeBaseTable,
  assistantMcpServerTable,
  assistantTable,
  appStateTable,
  groupTable,
  messageTable,
  pinTable,
  preferenceTable,
  promptTable,
  tagTable,
  entityTagTable,
  topicTable,
  userModelTable,
  userProviderTable,
};

export type DatabaseSchema = typeof schema;
