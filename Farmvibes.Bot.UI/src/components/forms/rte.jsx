import ListItem from "@tiptap/extension-list-item";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import Code from "@tiptap/extension-code";
import Blockquote from "@tiptap/extension-blockquote";
import Paragraph from "@tiptap/extension-paragraph";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import HardBreak from "@tiptap/extension-hard-break";
import Italic from "@tiptap/extension-italic";
import Bold from "@tiptap/extension-bold";
import { EditorContent, useEditor } from "@tiptap/react";
import Placeholder from "@tiptap/extension-placeholder";
import { DOMParser as ProseMirrorDOMParser } from "prosemirror-model";
import { marked } from "marked";
import {
  MarkdownSerializer as ProseMirrorMarkdownSerializer,
  defaultMarkdownSerializer,
} from "prosemirror-markdown";
import Link from "@tiptap/extension-link";
import CharacterCount from "@tiptap/extension-character-count";
import StarterKit from "@tiptap/starter-kit";
import {
  BoldIcon,
  BulletsIcon,
  Button,
  ItalicIcon,
  ListIcon,
  RedoIcon,
  StrikeIcon,
  UnderlineIcon,
  UndoIcon,
  Text,
  Flex,
  FormFieldCustom,
  LinkIcon,
  pxToRem,
} from "@fluentui/react-northstar";
import React from "react";
import { useIntl } from "react-intl";

const MenuBar = ({ editor }) => {
  const setLink = React.useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();

      return;
    }
    // update link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);
  if (!editor) {
    return null;
  }

  return (
    <Flex>
      <Button
        onClick={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleBold().run();
        }}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={
          editor.isActive("bold") ? "is-active toolbar-btn" : "toolbar-btn"
        }
        iconOnly
        icon={<BoldIcon />}
        text
      ></Button>
      <Button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={
          editor.isActive("italic") ? "is-active toolbar-btn" : "toolbar-btn"
        }
        icon={<ItalicIcon />}
        iconOnly
        text
      ></Button>
      <Button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={
          editor.isActive("strike") ? "is-active toolbar-btn" : "toolbar-btn"
        }
        icon={<StrikeIcon />}
        iconOnly
        text
      ></Button>

      <Button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={
          editor.isActive("bulletList")
            ? "is-active toolbar-btn"
            : "toolbar-btn"
        }
        iconOnly
        text
        icon={<BulletsIcon />}
      ></Button>
      <Button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={
          editor.isActive("orderedList")
            ? "is-active toolbar-btn"
            : "toolbar-btn"
        }
        iconOnly
        text
        icon={<ListIcon />}
      ></Button>
      <Button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={
          editor.isActive("underline") ? "is-active toolbar-btn" : "toolbar-btn"
        }
        iconOnly
        text
        icon={<UnderlineIcon />}
      ></Button>
      <Button
        onClick={(e) => {
          e.preventDefault();
          setLink();
        }}
        className={
          editor.isActive("link") ? "is-active toolbar-btn" : "toolbar-btn"
        }
        icon={<LinkIcon />}
        text
        iconOnly
      ></Button>
      <Button
        onClick={() => editor.chain().focus().undo().run()}
        className={"toolbar-btn"}
        iconOnly
        text
        icon={<UndoIcon />}
        disabled={!editor.can().chain().focus().undo().run()}
      ></Button>
      <Button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className={"toolbar-btn"}
        iconOnly
        text
        icon={<RedoIcon />}
      ></Button>
    </Flex>
  );
};

const tableMap = new WeakMap();

function isInTable(node) {
  return tableMap.has(node);
}

export function renderHardBreak(state, node, parent, index) {
  const br = isInTable(parent) ? "<br>" : "\\\n";
  for (let i = index + 1; i < parent.childCount; i += 1) {
    if (parent.child(i).type !== node.type) {
      state.write(br);
      return;
    }
  }
}

export function renderOrderedList(state, node) {
  const { parens } = node.attrs;
  const start = node.attrs.start || 1;
  const maxW = String(start + node.childCount - 1).length;
  const space = state.repeat(" ", maxW + 2);
  const delimiter = parens ? ")" : ".";
  state.renderList(node, space, (i) => {
    const nStr = String(start + i);
    return `${state.repeat(" ", maxW - nStr.length) + nStr}${delimiter} `;
  });
}

export function isPlainURL(link, parent, index, side) {
  if (link.attrs.title || !/^\w+:/.test(link.attrs.href)) return false;
  const content = parent.child(index + (side < 0 ? -1 : 0));
  if (
    !content.isText ||
    content.text !== link.attrs.href ||
    content.marks[content.marks.length - 1] !== link
  )
    return false;
  if (index === (side < 0 ? 1 : parent.childCount - 1)) return true;
  const next = parent.child(index + (side < 0 ? -2 : 1));
  return !link.isInSet(next.marks);
}

const serializerMarks = {
  ...defaultMarkdownSerializer.marks,
  [Bold.name]: defaultMarkdownSerializer.marks.strong,
  [Strike.name]: {
    open: "~~",
    close: "~~",
    mixable: true,
    expelEnclosingWhitespace: true,
  },
  [Italic.name]: {
    open: "_",
    close: "_",
    mixable: true,
    expelEnclosingWhitespace: true,
  },
  [Code.name]: defaultMarkdownSerializer.marks.code,
  [Link.name]: {
    open(state, mark, parent, index) {
      return isPlainURL(mark, parent, index, 1) ? "<" : "[";
    },
    close(state, mark, parent, index) {
      const href = mark.attrs.canonicalSrc || mark.attrs.href;

      return isPlainURL(mark, parent, index, -1)
        ? ">"
        : `](${state.esc(href)}${
            mark.attrs.title ? ` ${state.quote(mark.attrs.title)}` : ""
          })`;
    },
  },
};

const serializerNodes = {
  ...defaultMarkdownSerializer.nodes,
  [Paragraph.name]: defaultMarkdownSerializer.nodes.paragraph,
  [BulletList.name]: defaultMarkdownSerializer.nodes.bullet_list,
  [ListItem.name]: defaultMarkdownSerializer.nodes.list_item,
  [HorizontalRule.name]: defaultMarkdownSerializer.nodes.horizontal_rule,
  [OrderedList.name]: renderOrderedList,
  [HardBreak.name]: renderHardBreak,

  [Blockquote.name]: (state, node) => {
    if (node.attrs.multiline) {
      state.write(">>>");
      state.ensureNewLine();
      state.renderContent(node);
      state.ensureNewLine();
      state.write(">>>");
      state.closeBlock(node);
    } else {
      state.wrapBlock("> ", null, node, () => state.renderContent(node));
    }
  },
};

function serialize(schema, content) {
  const proseMirrorDocument = schema.nodeFromJSON(content);
  const serializer = new ProseMirrorMarkdownSerializer(
    serializerNodes,
    serializerMarks
  );

  return serializer.serialize(proseMirrorDocument, {
    tightLists: true,
  });
}

function deserialize(schema, content) {
  const html = marked.parse(content);

  if (!html) return null;

  const parser = new DOMParser();
  const { body } = parser.parseFromString(html, "text/html");

  // append original source as a comment that nodes can access
  body.append(document.createComment(content));

  const state = ProseMirrorDOMParser.fromSchema(schema).parse(body);

  return state.toJSON();
}

export const RichEditor = ({
  label,
  height = 150,
  placeholder,
  handleChange,
  name,
  onBlur,
  hint,
  val,
}) => {
  const intl = useIntl();
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Underline,
      CharacterCount,
      Link,
      Placeholder.configure({
        placeholder: placeholder,
      }),
    ],
    content: "",
    onBlur: ({ editor, event }) => {
      event.preventDefault();
      if (
        event.relatedTarget &&
        event.relatedTarget.className.includes("toolbar-btn")
      ) {
        event.relatedTarget.dispatchEvent(new MouseEvent("click"));
        setTimeout(
          () =>
            onBlur({ name, value: serialize(editor.schema, editor.getJSON()) }),
          1500
        );
      } else if (
        event.relatedTarget &&
        event.relatedTarget.className.includes("save-content-btn")
      ) {
        onBlur({
          name,
          value: serialize(editor.schema, editor.getJSON()),
        }).then((resp) => {
          event.relatedTarget.dispatchEvent(new MouseEvent("click"));
        });
      } else {
        onBlur({ name, value: serialize(editor.schema, editor.getJSON()) });
      }
    },
    onUpdate: ({ editor }) => {
      handleChange(name, serialize(editor.schema, editor.getJSON()));
    },
  });

  React.useEffect(() => {
    if (!editor) return;
    editor.commands.setContent(deserialize(editor.schema, val));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <Flex column>
      <Text color="brand" content={label} weight="semibold" />
      <FormFieldCustom
        style={{
          border: "1px solid",
          padding: "0 0.5em  0em",
          paddingRight: "15px",
          minHeight: pxToRem(height),
        }}
      >
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </FormFieldCustom>

      <Text
        content={intl.formatMessage(
          { id: "general.character.count" },
          { count: editor.storage.characterCount.characters() }
        )}
        size="smallest"
        disabled
        temporary
        weight="light"
        color="grey"
      />
      <Text color="grey" content={hint} disabled temporary />
    </Flex>
  );
};
