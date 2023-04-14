import * as React from "react";
import Prism from "prismjs";
import { Editor, Transforms, createEditor } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { getFromStorage } from "helpers/utils";
import isHotkey from "is-hotkey";
import {
  FormFieldCustom,
  BoldIcon,
  ItalicIcon,
  UserBlurIcon,
  UnderlineIcon,
  StrikeIcon,
  RemoveFormatIcon,
  ClipboardCopiedToIcon,
  Toolbar,
  pxToRem,
  Text,
  NotepadPersonIcon,
} from "@fluentui/react-northstar";
import { Stack } from "@fluentui/react";
import { serialize } from "helpers/utils";

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code",
};

// eslint-disable-next-line
Prism.languages.markdown=Prism.languages.extend("markup",{}),Prism.languages.insertBefore("markdown","prolog",{blockquote:{pattern:/^>(?:[\t ]*>)*/m,alias:"punctuation"},code:[{pattern:/^(?: {4}|\t).+/m,alias:"keyword"},{pattern:/``.+?``|`[^`\n]+`/,alias:"keyword"}],title:[{pattern:/\w+.*(?:\r?\n|\r)(?:==+|--+)/,alias:"important",inside:{punctuation:/==+$|--+$/}},{pattern:/(^\s*)#+.+/m,lookbehind:!0,alias:"important",inside:{punctuation:/^#+|#+$/}}],hr:{pattern:/(^\s*)([*-])([\t ]*\2){2,}(?=\s*$)/m,lookbehind:!0,alias:"punctuation"},list:{pattern:/(^\s*)(?:[*+-]|\d+\.)(?=[\t ].)/m,lookbehind:!0,alias:"punctuation"},"url-reference":{pattern:/!?\[[^\]]+\]:[\t ]+(?:\S+|<(?:\\.|[^>\\])+>)(?:[\t ]+(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\)))?/,inside:{variable:{pattern:/^(!?\[)[^\]]+/,lookbehind:!0},string:/(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\))$/,punctuation:/^[\[\]!:]|[<>]/},alias:"url"},bold:{pattern:/(^|[^\\])(\*\*|__)(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,lookbehind:!0,inside:{punctuation:/^\*\*|^__|\*\*$|__$/}},strikethrough:{pattern:/(^|[^\\])([*~])(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,lookbehind:!0,inside:{punctuation:/^[*~]|[*~]$/}},italic:{pattern:/(^|[^\\])([*_])(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,lookbehind:!0,inside:{punctuation:/^[*_]|[*_]$/}},url:{pattern:/!?\[[^\]]+\](?:\([^\s)]+(?:[\t ]+"(?:\\.|[^"\\])*")?\)| ?\[[^\]\n]*\])/,inside:{variable:{pattern:/(!?\[)[^\]]+(?=\]$)/,lookbehind:!0},string:{pattern:/"(?:\\.|[^"\\])*"(?=\)$)/}}}}),
// Notice the `inside` props here being applied to bold, strikethrough and italic:
Prism.languages.markdown.bold.inside.url=Prism.util.clone(Prism.languages.markdown.url),
Prism.languages.markdown.italic.inside.url=Prism.util.clone(Prism.languages.markdown.url),
Prism.languages.markdown.bold.inside.italic = Prism.util.clone(Prism.languages.markdown.italic),
Prism.languages.markdown.bold.inside.strikethrough = Prism.util.clone(Prism.languages.markdown.strikethrough),
Prism.languages.markdown.italic.inside.bold = Prism.util.clone(Prism.languages.markdown.bold), 
Prism.languages.markdown.italic.inside.strikethrough = Prism.util.clone(Prism.languages.markdown.strikethrough),
Prism.languages.markdown.strikethrough.inside.bold = Prism.util.clone(Prism.languages.markdown.bold),
Prism.languages.markdown.strikethrough.inside.italic = Prism.util.clone(Prism.languages.markdown.italic); // prettier-ignore

export const RichTextEditor = ({
  val,
  placeholder,
  handleChange,
  name,
  onBlur,
  hint,
  label,
  height = 150,
}) => {
  const [value, setValue] = React.useState(() => {
    if (Array.isArray(val)) {
      return val;
    } else if (typeof val === "string") {
      return deserialize(val);
    } else return deserialize("");
  });
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [hasChanged, setHasChanged] = React.useState(false);
  const [slateKey, setSlateKey] = React.useState(1);
  const renderElement = React.useCallback(
    (props) => <Element {...props} />,
    []
  );
  const renderLeaf = React.useCallback((props) => <Leaf {...props} />, []);
  const [editor] = React.useState(() => withReact(createEditor()));
  const handlePlaceholderClick = (e, props) => {
    e.preventDefault();
    Transforms.insertText(editor, ` #${props.content.split(" ")[1]}# `);
  };

  return (
    <Stack>
      <Text color='brand' content={label} weight='semibold' />
      <FormFieldCustom
        style={{
          border: "1px solid #2A2A2A",
          minHeight: pxToRem(height),
          padding: "0 0.5em  0em",
          width: "100%",
          marginTop: "10px",
        }}
      >
        <Slate
          key={slateKey}
          editor={editor}
          value={value}
          onChange={(newValue) => {
            if (serialize(newValue) === serialize(value)) return;

            setHasChanged(true);
            setValue(newValue);
            handleChange(name, newValue);
          }}
        >
          <Stack>
            <Stack.Item grow={1}>
              <Toolbar
                aria-label='Text editor'
                items={[
                  {
                    icon: (
                      <BoldIcon
                        {...{
                          outline: true,
                        }}
                      />
                    ),
                    key: "bold",
                    kind: "toggle",
                    active: isMarkActive(editor, "bold"),
                    size: "small",
                    title: "Toggle bold",
                    onClick: (e) => {
                      e.preventDefault();
                      toggleMark(editor, "bold");
                    },
                  },
                  {
                    icon: (
                      <ItalicIcon
                        {...{
                          outline: true,
                        }}
                      />
                    ),
                    key: "italic",
                    kind: "toggle",
                    active: isMarkActive(editor, "italic"),
                    title: "Toggle italic",
                    size: "small",
                    onClick: (e) => {
                      e.preventDefault();
                      toggleMark(editor, "italic");
                    },
                  },
                  {
                    icon: (
                      <UnderlineIcon
                        {...{
                          outline: true,
                        }}
                      />
                    ),
                    key: "underline",
                    kind: "toggle",
                    active: isMarkActive(editor, "underline"),
                    title: "Toggle underline",
                    size: "small",
                    onClick: (e) => {
                      e.preventDefault();
                      toggleMark(editor, "underline");
                    },
                  },
                  {
                    icon: (
                      <StrikeIcon
                        {...{
                          outline: true,
                        }}
                      />
                    ),
                    key: "strike",
                    kind: "toggle",
                    active: isMarkActive(editor, "strikethrough"),
                    disabled: false,
                    size: "small",
                    title: "Toggle strike",
                    onClick: (e) => {
                      e.preventDefault();
                      toggleMark(editor, "strikethrough");
                    },
                  },
                  {
                    icon: (
                      <ClipboardCopiedToIcon
                        {...{
                          outline: true,
                        }}
                      />
                    ),
                    key: "copy",
                    kind: "toggle",
                    disabled: false,
                    title: "Copy",
                    onClick: (e) => {
                      e.preventDefault();
                      navigator.clipboard.writeText(Editor.string(editor, []));
                    },
                  },
                  {
                    icon: (
                      <ClipboardCopiedToIcon
                        {...{
                          outline: true,
                        }}
                      />
                    ),
                    key: "paste",
                    disabled: false,
                    size: "medium",
                    title: "Paste",
                    onClick: (e) => {
                      e.preventDefault();
                      navigator.clipboard.readText().then((copiedText) => {
                        Transforms.insertText(editor, copiedText);
                      });
                    },
                  },
                  {
                    icon: (
                      <RemoveFormatIcon
                        {...{
                          outline: true,
                        }}
                      />
                    ),
                    key: "remove-format",
                    title: "Remove formatting",
                    onClick: (e) => {
                      e.preventDefault();

                      //Removes formarting, separating paragraphs with carriage return characters
                      const plainString = Editor.string(editor, []);
                      //Updates state with new values
                      handleChange(name, plainString);
                      setValue(plainString);

                      //Forces rerender by updating key value
                      setSlateKey(slateKey + 1);
                    },
                  },
                  {
                    icon: (
                      <NotepadPersonIcon
                        {...{
                          outline: true,
                        }}
                      />
                    ),
                    key: "placeholder",
                    active: menuOpen,
                    title: "Insert dynamic text",
                    menu: [
                      {
                        key: "firstname",
                        content: `Insert firstname`,
                        onClick: handlePlaceholderClick,
                      },
                      {
                        key: "surname",
                        content: `Insert surname`,
                        onClick: handlePlaceholderClick,
                      },
                      ...getFromStorage("reg").map((question) => {
                        return {
                          key: question.description,
                          content: `Insert ${question.description}`,
                          onClick: handlePlaceholderClick,
                        };
                      }),
                    ],
                    menuOpen,
                    onMenuOpenChange: (e, { menuOpen }) => {
                      e.preventDefault();
                      setMenuOpen(menuOpen);
                    },
                  },
                ]}
              />
            </Stack.Item>
            <Stack.Item
              grow={4}
              styles={{
                root: {
                  minHeight: 100,
                },
              }}
            >
              <Editable
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                placeholder={placeholder}
                spellCheck
                autoFocus
                onKeyDown={(event) => {
                  for (const hotkey in HOTKEYS) {
                    if (isHotkey(hotkey, event)) {
                      event.preventDefault();
                      const mark = HOTKEYS[hotkey];
                      toggleMark(editor, mark);
                    }
                  }
                }}
                onBlur={(e) => {
                  hasChanged && onBlur(name, Editor.string(editor, []));
                  setHasChanged(false);
                }}
              />
            </Stack.Item>
            <Stack.Item grow={1} align='end'>
              <Text
                content={`${serialize(value).length}  character(s)`}
                size='smallest'
                disabled
                temporary
                weight='light'
                color='grey'
              />
            </Stack.Item>
          </Stack>
        </Slate>
      </FormFieldCustom>
      <Text color='grey' content={hint} disabled temporary />
    </Stack>
  );
};

const Element = ({ attributes, children, element }) => {
  switch (element.type) {
    case "block-quote":
      return <blockquote {...attributes}>{children}</blockquote>;
    case "bulleted-list":
      return <ul {...attributes}>{children}</ul>;
    case "heading-one":
      return <h1 {...attributes}>{children}</h1>;
    case "heading-two":
      return <h2 {...attributes}>{children}</h2>;
    case "list-item":
      return <li {...attributes}>{children}</li>;
    case "numbered-list":
      return <ol {...attributes}>{children}</ol>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  if (leaf.strikethrough) {
    children = <s>{children}</s>;
  }

  return <span {...attributes}>{children}</span>;
};

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

// Define a deserializing function that takes a string and returns a value.
const deserialize = (text) => {
  if (text.length === 0)
    return [{ type: "paragraph", children: [{ text: text }] }];
  // Return a value array of children derived by splitting the string.
  return text.split("\n").map((line) => {
    let children = Prism.tokenize(line, Prism.languages.markdown).map(
      (token) => {
        if (typeof token === "string") return { text: token };
        else {
          return { [token.type]: true, text: token.content[1] };
        }
      }
    );
    return { type: "paragraph", children };
  });
};
