import { MACRO_ACTION_TYPES as macroActionTypes } from './macroConstants';
import { Agent, Label, Team } from '@/types';

type File = {
  id: number;
  blob_id: number;
  filename: string;
};

export const emptyMacro = {
  name: '',
  actions: [
    {
      action_name: 'assign_team',
      action_params: [],
    },
  ],
  visibility: 'global',
};

export const resolveActionName = (key: string) => {
  const action = macroActionTypes.find(i => i.key === key);
  return action ? action.label : '';
};

export const resolveTeamIds = (teams: Team[], ids: number[]) => {
  return ids
    .map(id => {
      const team = teams.find(i => i.id === id);
      return team ? team.name : '';
    })
    .join(', ');
};

export const resolveLabels = (labels: Label[], ids: string[]) => {
  return ids
    .map(id => {
      const label = labels.find(i => i.title === id);
      return label ? label.title : '';
    })
    .join(', ');
};

export const resolveAgents = (agents: Agent[], ids: number[]) => {
  return ids
    .map(id => {
      const agent = agents.find(i => i.id === id);
      return agent ? agent.name : '';
    })
    .join(', ');
};

export const getFileName = (id: number, actionType: string, files: File[]) => {
  if (!id || !files) return '';
  if (actionType === 'send_attachment') {
    const file = files.find(item => item.blob_id === id);
    if (file) return file.filename.toString();
  }
  return '';
};
