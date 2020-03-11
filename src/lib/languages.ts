import { CommentDefinition, CommentType } from './config';

// NOTE: This is to keep the comment configuration together
// tslint:disable: object-literal-sort-keys
export const languages: CommentDefinition[] = [
  {
    languageId: [
      'javascript',
      'typescript',
    ],
    singleLineComment: '//',
    blockCommentStart: '/*',
    blockCommentEnd: '*/',
    commentType: CommentType.AllLines
  },
  {
    languageId: [
      'css',
    ],
    singleLineComment: '',
    blockCommentStart: '/*',
    blockCommentEnd: '*/',
    commentType: CommentType.MultiLines
  },
];