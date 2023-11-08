/* tslint:disable */
/* eslint-disable */
/**
 * This file was automatically generated by Payload.
 * DO NOT MODIFY IT BY HAND. Instead, modify your source Payload config,
 * and re-run `payload generate:types` to regenerate this file.
 */

export interface Config {
  collections: {
    users: User;
    posts: Post;
    tags: Tag;
    categories: Category;
    media: Medium;
    'payload-preferences': PayloadPreference;
    'payload-migrations': PayloadMigration;
  };
  globals: {
    kitchenSink: KitchenSink;
  };
}
export interface User {
  id: string;
  updatedAt: string;
  createdAt: string;
  email: string;
  resetPasswordToken?: string | null;
  resetPasswordExpiration?: string | null;
  salt?: string | null;
  hash?: string | null;
  loginAttempts?: number | null;
  lockUntil?: string | null;
  password: string | null;
}
export interface Post {
  id: string;
  title: string;
  subtitle: string;
  category?: (string | null) | Category;
  tagsAndCategories?:
    | (
        | {
            relationTo: 'tags';
            value: string | Tag;
          }
        | {
            relationTo: 'categories';
            value: string | Category;
          }
      )[]
    | null;
  status?: ('draft' | 'published') | null;
  description?: string | null;
  updatedAt: string;
  createdAt: string;
  _status?: ('draft' | 'published') | null;
}
export interface Category {
  id: string;
  name: string;
  updatedAt: string;
  createdAt: string;
}
export interface Tag {
  id: string;
  name: string;
  updatedAt: string;
  createdAt: string;
}
export interface Medium {
  id: string;
  updatedAt: string;
  createdAt: string;
  url?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
}
export interface PayloadPreference {
  id: string;
  user: {
    relationTo: 'users';
    value: string | User;
  };
  key?: string | null;
  value?:
    | {
        [k: string]: unknown;
      }
    | unknown[]
    | string
    | number
    | boolean
    | null;
  updatedAt: string;
  createdAt: string;
}
export interface PayloadMigration {
  id: string;
  name?: string | null;
  batch?: number | null;
  updatedAt: string;
  createdAt: string;
}
export interface KitchenSink {
  id: string;
  array: {
    text?: string | null;
    number?: number | null;
    id?: string | null;
  }[];
  blocks: (
    | {
        text1: string;
        text2: string;
        id?: string | null;
        blockName?: string | null;
        blockType: 'testBlock1';
      }
    | {
        number1?: number | null;
        number2?: number | null;
        id?: string | null;
        blockName?: string | null;
        blockType: 'testBlock2';
      }
    | {
        textPosition: 'left' | 'right';
        text: {
          [k: string]: unknown;
        }[];
        medium: string | Medium;
        id?: string | null;
        blockName?: string | null;
        blockType: 'complexBlock';
      }
  )[];
  checkbox: boolean;
  code: string;
  date: string;
  email: string;
  group?: {
    text?: string | null;
    number?: number | null;
  };
  json:
    | {
        [k: string]: unknown;
      }
    | unknown[]
    | string
    | number
    | boolean
    | null;
  number: number;
  /**
   * @minItems 2
   * @maxItems 2
   */
  point: [number, number];
  radio: 'radio1' | 'radio2';
  relationship1: string | Tag;
  relationship2: (string | Tag)[];
  relationship3:
    | {
        relationTo: 'categories';
        value: string | Category;
      }
    | {
        relationTo: 'tags';
        value: string | Tag;
      };
  relationship4: (
    | {
        relationTo: 'categories';
        value: string | Category;
      }
    | {
        relationTo: 'tags';
        value: string | Tag;
      }
  )[];
  richText: {
    [k: string]: unknown;
  }[];
  select1: 'select1' | 'select2';
  select2: ('select1' | 'select2')[];
  text: string;
  textarea: string;
  upload: string | Medium;
  updatedAt?: string | null;
  createdAt?: string | null;
}


declare module 'payload' {
  export interface GeneratedTypes extends Config {}
}