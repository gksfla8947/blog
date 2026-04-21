import { BlockNoteSchema, createCodeBlockSpec } from "@blocknote/core";
import { codeBlockOptions } from "@blocknote/code-block";
import { Callout } from "./CalloutBlock";

// 에디터와 포스트 뷰에서 공통으로 사용하는 스키마.
// 이 스키마를 공유해야 작성 시의 모양과 실제 글 모양이 동일하게 유지된다.
const extendedCodeBlockOptions = {
  ...codeBlockOptions,
  supportedLanguages: {
    ...codeBlockOptions.supportedLanguages,
    dockerfile: {
      name: "Dockerfile",
      aliases: ["dockerfile", "docker"],
    },
  },
};

export const blocknoteSchema = BlockNoteSchema.create().extend({
  blockSpecs: {
    codeBlock: createCodeBlockSpec(extendedCodeBlockOptions),
    callout: Callout(),
  },
});

export type BlocknoteSchema = typeof blocknoteSchema;
