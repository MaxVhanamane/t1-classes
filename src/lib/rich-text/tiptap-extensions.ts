// lib/tiptap-extensions.ts

import StarterKit from "@tiptap/starter-kit";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Mathematics from "@tiptap/extension-mathematics";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";

export const TiptapExtensions = [
    StarterKit,
    Image,
    Subscript,
    Superscript,
    Mathematics,
    TableKit.configure({
        table: {
            HTMLAttributes: {
                class: "tiptap-table",
            },
        },
    }),
];
