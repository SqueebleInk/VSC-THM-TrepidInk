import * as vscode from 'vscode';

type TagConfig = {
  color: string,
  tag: string
};

enum CommentType {
  AllLine = 'All',
  MultiLine = 'Block',
  SingleLine = 'Single',
  NoLine = 'No',
}

interface TrepidInkConfig {
  enabled: string;
  tags: TagConfig[];
}

const GetConfig = (): TrepidInkConfig =>
{
  const config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('trepid-ink');

  return {
    enabled: config.get('comments') as CommentType,
    tags: config.get('tags') as TagConfig[],
  };
};

export { GetConfig, TrepidInkConfig, TagConfig, CommentType };