import { CommentType, CommentDefinition } from "./config";

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
  }
];