import * as vscode from 'vscode';
import { CommentType, GetConfig } from './config';

type TagData = {
  tag: string,
  endTag: string,
  style: vscode.TextEditorDecorationType;
  ranges: vscode.DecorationOptions[];
};

export class Parser {
  private _tags: TagData[] = [];
  private _regEx: string = '';

  private _singleLineComment: string = '';
  private _blockCommentStart: string = '';
  private _blockCommentEnd: string = '';

  private _commentType: CommentType = CommentType.AllLine;

  private _supportedLanguage: boolean = false;

  public get supportedLanguage ():boolean {
    return this._supportedLanguage;
  }

  public constructor ()
  {
    this._commentType = GetConfig().enabled as CommentType;

    GetConfig().tags.forEach(item => {
      let styling = { color: item.color };

      this._tags.push({
        endTag: item.tag.replace(/([()[{*+.$^\\|?])/g, '\\$1'),
        ranges: [],
        style: vscode.window.createTextEditorDecorationType(styling),
        tag: item.tag,
      });
    });
  }

  private _SetChips (languageId: string)
  {
    this._supportedLanguage = true;

    switch (languageId) {
      case 'javascript':
      case 'typescript': {
        this._SetCommentChips('/*', '*/', '//');
      }
      default: {
        this._supportedLanguage = false;
      } break;
    }
  }

  private _SetCommentChips (start: string, end: string, single: string = '')
  {
    if (single !== '') {
      this._singleLineComment = single;
    } else {
      this._commentType = CommentType.MultiLine;
    }

    if (
      this._commentType === CommentType.AllLine ||
      this._commentType === CommentType.MultiLine
    ) {
      this._blockCommentStart = this._EndRegEx(start);
      this._blockCommentEnd = this._EndRegEx(end);
    }
  }

  private _EndRegEx (text: string): string
  {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  public SetRegex (languageId: string)
  {
    this._SetChips(languageId);

    if (!this.supportedLanguage) { return; }

    const characters: string[] = [];
    this._tags.forEach(({ endTag }) => {
      characters.push(endTag);
    });

    this._regEx = '(' + this._singleLineComment.replace(/\//ig, '\\/') + ')+( |\t)*';

    this._regEx += '(';
    this._regEx += characters.join('|');
    this._regEx += ')+(.*)';
  }

  public FindSingleLineComments (activeEditor: vscode.TextEditor)
  {
    let text = activeEditor.document.getText();
    let regEx = new RegExp(this._regEx, 'ig');

    let match: RegExpExecArray | null;
    while (match = regEx.exec(text)) {
      const startPos = activeEditor.document.positionAt(match.index);
      const endPos = activeEditor.document.positionAt(match.index + match[0].length);
      const range = { range: new vscode.Range(startPos, endPos) };

      if (match !== null) {
        // @ts-ignore
        const matchTag = this._tags.find(item => item.tag.toLowerCase() === match[3].toLowerCase());
        if (matchTag) {
          matchTag.ranges.push(range);
        }
      }
    }
  }

  public FindBlockComments (activeEditor: vscode.TextEditor)
  {
    let text = activeEditor.document.getText();

    const characters: string[] = [];
    this._tags.forEach(({ endTag }) => {
      characters.push(endTag);
    });

    let regExComment = '(^)+([ \\t]*[ \\t]*)(';
    regExComment += characters.join('|');
    regExComment += ')([ ]*|[:])+([^*/][^\\r\\n]*)';

    let regExString = '(^|[ \\t])(';
		regExString += this._blockCommentStart;
		regExString += '[\\s])+([\\s\\S]*?)(';
		regExString += this._blockCommentEnd;
    regExString += ')';
    
    let stringRegEx = new RegExp(regExString, 'gm');
    let commentRegEx = new RegExp(regExComment, 'igm');

    let match: RegExpExecArray | null;
    while (match = stringRegEx.exec(text)) {
      let commentBlock = match[0];

      let line: RegExpExecArray | null;
      while (line = commentRegEx.exec(commentBlock)) {
        const startPos = activeEditor.document.positionAt(match.index);
        const endPos = activeEditor.document.positionAt(match.index + match[0].length);
        const range = { range: new vscode.Range(startPos, endPos) };

        if (line !== null) {
          // @ts-ignore
          const matchTag = this._tags.find(item => item.tag.toLowerCase() === line[3].toLowerCase());
          if (matchTag) {
            matchTag.ranges.push(range);
          }
        }
      }
    }
  }

  public FindJSDocComments (activeEditor: vscode.TextEditor)
  {
    // TODO Add in JSDoc comments
  }

  public ApplyStyle (activeEditor: vscode.TextEditor)
  {
    // TODO Add in styling
  }
}