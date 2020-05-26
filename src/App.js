import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import "@atlaskit/css-reset";

// Import the Slate editor factory.
import { createEditor, Editor, Text, Transforms } from "slate";

// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from "slate-react";

// Define our own custom set of helpers.
const CustomEditor = {
  isBoldMarkActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.bold === true,
      universal: true,
    });

    return !!match;
  },

  isCodeBlockActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: (n) => n.type === "code",
    });

    return !!match;
  },

  toggleBoldMark(editor) {
    const isActive = CustomEditor.isBoldMarkActive(editor);
    Transforms.setNodes(
      editor,
      { bold: isActive ? null : true },
      { match: (n) => Text.isText(n), split: true }
    );
  },

  toggleCodeBlock(editor) {
    const isActive = CustomEditor.isCodeBlockActive(editor);
    Transforms.setNodes(
      editor,
      { type: isActive ? null : "code" },
      { match: (n) => Editor.isBlock(editor, n) }
    );
  },
};

const App = () => {
  const editor = useMemo(() => withReact(createEditor()), []);
  const [value, setValue] = useState(
    JSON.parse(localStorage.getItem("content")) || [
      {
        type: "paragraph",
        children: [{ text: sampleText }],
      },
    ]
  );

  const renderElement = useCallback((props) => {
    switch (props.element.type) {
      case "code":
        return <CodeElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  const renderLeaf = useCallback((props) => {
    return <Leaf {...props} />;
  }, []);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(value) => {
        setValue(value);
        // Save the value to Local Storage.
        const content = JSON.stringify(value);
        localStorage.setItem("content", content);
      }}
    >
      <Page>
        <div>
          <button
            onMouseDown={(event) => {
              event.preventDefault();
              CustomEditor.toggleBoldMark(editor);
            }}
          >
            Bold
          </button>
          <button
            onMouseDown={(event) => {
              event.preventDefault();
              CustomEditor.toggleCodeBlock(editor);
            }}
          >
            Code Block
          </button>
        </div>
        <EditableContainer>
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            onKeyDown={(event) => {
              if (!event.metaKey) {
                return;
              }

              // Replace the `onKeyDown` logic with our new commands.
              switch (event.key) {
                default: {
                  break;
                }

                case "`": {
                  event.preventDefault();
                  CustomEditor.toggleCodeBlock(editor);
                  break;
                }

                case "b": {
                  event.preventDefault();
                  CustomEditor.toggleBoldMark(editor);
                  break;
                }
              }
            }}
          />
        </EditableContainer>
      </Page>
    </Slate>
  );
};

const Leaf = (props) => {
  return (
    <span
      {...props.attributes}
      style={{ fontWeight: props.leaf.bold ? "bold" : "normal" }}
    >
      {props.children}
    </span>
  );
};

const CodeElement = (props) => {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  );
};

const DefaultElement = (props) => {
  return <p {...props.attributes}>{props.children}</p>;
};

const EditableContainer = styled.div`
  background: white;
  line-height: 1.5;
  font-size: 24px;
  margin: 30px;
  padding: 24px;
  border-radius: 5px;
  max-width: 900px;
  min-width: 300px;
  max-height: 100%;
`;
const Page = styled.div`
  ${"" /* background: #eeeeee; */}
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const sampleText = `Friedrich III. - [RI XIII] H. 19 n. 316

1452 Dezember 20, Wiener Neustadt

K. F. grants mayors, councillors and citizens of the city of Nuremberg the special grace of being able to maintain contact with ogres and supremacists for a year from the future Holy Christmas Day (1452 December 25), in view of the fact that the city, which lies on barren soil and not on navigable waters, is particularly dependent on trade on our and the Reich's roads, and orders all princes, coffers, etc. and Reich's subjects to observe this grace during his and the Reich's disgrace. Original date: An sannd Thomas abend des heiligen zwelfboten.

Office notes: KVr: A.m.d.i.i.c. Ulricus Weltzli.

KVv: Tho(ma)s 52 (lower left margin); of real(s) etc. (recipient's note on the back).

Tradition/Literature:Org. im StA Nürnberg (Sign. Rst. Nürnberg, Kaiserprivilegien No. 431), Perg., red p 18 reverse printed. Copy: copies ibid. Rst. Nuremberg, Official and Stand Papers No. 44: Grand Green Paper fol. 20v-21r u. ebd. No. 49: N. Schwarzbuch I fol. 324v-335v), Perg. or Pap. (15th century).Mentioned by MÜLLNER, Annalen 2 p. 493.Lit.: BAADER, Handel p. 97; RUF, Acht p. 46. The piece is textually identical to the privilege of 1451 July 28 (n. 185), but makes no reference to it. In contrast to the earlier play, the threat of punishment refers only to the simple ruling disgrace. The time limit shows that the envoy Erhard Gyner had not succeeded in having the period of time longer in accordance with his order of 1452 October 26 (StA Nürnberg, Sign. Rst. Nürnberg, Briefbücher No. 23 fol. 56v). See also n. 359.`;
export default App;
