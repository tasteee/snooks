#!/usr/bin/env node

import path from "node:path";
import process from "node:process";
import fs from "fs-extra";
import matter from "gray-matter";
import { globby } from "globby";
import { Command } from "commander";
import { input, select } from "@inquirer/prompts";
import { constantCase, camelCase } from "change-case";

type SnooksConfigT = Record<string, unknown>;
type SnooksArgsT = Record<string, unknown>;

type TemplateMetaT = {
  name?: string;
  output?: string;
};

type TemplateT = {
  slug: string;
  path: string;
  meta: TemplateMetaT;
  content: string;
};

const fencePattern = /```([a-zA-Z0-9_-]*)\s*([^\n`]*)\n([\s\S]*?)```/g;
const outputPattern = /output=(?:"([^"]+)"|'([^']+)'|([^\s]+))/;
const tokenPattern = /\[\[\s*(ARGS|CONFIG)\.([A-Z0-9_-]+)\s*\]\]/gi;
const newTokenPattern = /\$\{(args|config)\.([a-z0-9_-]+)\}\$/gi;
const simpleTokenPattern = /\$\$([a-z0-9_-]+)/gi;
const legacyTokenPattern = /\$\(\s*(ARG|ENV)\.([A-Z0-9_-]+)\s*\)/gi;

const findUp = async (name: string, startPath: string) => {
  let currentPath = path.resolve(startPath);

  while (true) {
    const targetPath = path.join(currentPath, name);
    const exists = await fs.pathExists(targetPath);

    if (exists) {
      return targetPath;
    }

    const parentPath = path.dirname(currentPath);
    const isRoot = parentPath === currentPath;

    if (isRoot) {
      return undefined;
    }

    currentPath = parentPath;
  }
};

const readPackageConfig = async (snooksPath: string) => {
  const packageJsonPath = path.join(path.dirname(snooksPath), "package.json");
  const exists = await fs.pathExists(packageJsonPath);

  if (!exists) {
    return {};
  }

  const packageJson = await fs.readJson(packageJsonPath);
  const config = packageJson.snooks;

  if (!config || typeof config !== "object") {
    return {};
  }

  return config as SnooksConfigT;
};

const readTemplates = async (snooksPath: string) => {
  const files = await globby("*.md", {
    cwd: snooksPath,
    absolute: true,
  });

  const templates = await Promise.all(
    files.map(async (filePath) => {
      const raw = await fs.readFile(filePath, "utf8");
      const parsed = matter(raw);

      return {
        slug: path.basename(filePath, ".md"),
        path: filePath,
        meta: parsed.data as TemplateMetaT,
        content: parsed.content,
      };
    }),
  );

  return templates;
};

const getValue = (source: Record<string, unknown>, key: string) => {
  const directValue = source[key];

  if (directValue !== undefined) {
    return directValue;
  }

  const constantValue = source[constantCase(key)];

  if (constantValue !== undefined) {
    return constantValue;
  }

  return source[camelCase(key)];
};

const render = (value: string, args: SnooksArgsT, config: SnooksConfigT) => {
  const standardRendered = value.replace(tokenPattern, (...match) => {
    const namespace = String(match[1]).toUpperCase();
    const key = String(match[2]);
    const source = namespace === "ARGS" ? args : config;
    const resolvedValue = getValue(source, key);

    return String(resolvedValue ?? "");
  });

  const newStyleRendered = standardRendered.replace(
    newTokenPattern,
    (...match) => {
      const namespace = String(match[1]).toLowerCase();
      const key = String(match[2]);
      const source = namespace === "args" ? args : config;
      const resolvedValue = getValue(source, key);

      return String(resolvedValue ?? "");
    },
  );

  const simpleRendered = newStyleRendered.replace(
    simpleTokenPattern,
    (...match) => {
      const key = String(match[1]);
      const resolvedValue = getValue(args, key);

      return String(resolvedValue ?? "");
    },
  );

  const legacyRendered = simpleRendered.replace(
    legacyTokenPattern,
    (...match) => {
      const namespace = String(match[1]).toUpperCase();
      const key = String(match[2]);
      const source = namespace === "ARG" ? args : config;
      const resolvedValue = getValue(source, key);

      return String(resolvedValue ?? "");
    },
  );

  return legacyRendered;
};

const parseValue = (value: string) => {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  if (value === "null") {
    return null;
  }

  const isNumber = value !== "" && Number.isNaN(Number(value)) === false;

  if (isNumber) {
    return Number(value);
  }

  const isJson = value.startsWith("{") || value.startsWith("[");

  if (isJson) {
    return JSON.parse(value);
  }

  return value;
};

const parseKeyValues = (values: string[]) => {
  const args: SnooksArgsT = {};

  for (const value of values) {
    const separatorIndex = value.indexOf("=");
    const isPair = separatorIndex > -1;

    if (!isPair) {
      continue;
    }

    const key = value.slice(0, separatorIndex);
    const rawValue = value.slice(separatorIndex + 1);

    args[key] = parseValue(rawValue);
  }

  return args;
};

const parseOutput = (attributes: string) => {
  const match = attributes.match(outputPattern);

  if (!match) {
    return undefined;
  }

  return match[1] || match[2] || match[3];
};

const extractFiles = (template: TemplateT) => {
  const files = [];

  for (const match of template.content.matchAll(fencePattern)) {
    const attributes = match[2] || "";
    const output = parseOutput(attributes);

    if (!output) {
      continue;
    }

    files.push({
      output,
      content: match[3] || "",
    });
  }

  return files;
};

const chooseTemplate = async (
  templates: TemplateT[],
  requestedTemplate?: string,
) => {
  if (requestedTemplate) {
    const template = templates.find((item) => {
      return (
        item.slug === requestedTemplate || item.meta.name === requestedTemplate
      );
    });

    if (!template) {
      throw new Error(`Template not found: ${requestedTemplate}`);
    }

    return template;
  }

  const slug = await select({
    message: "Choose a template",
    choices: templates.map((template) => {
      return {
        name: template.meta.name || template.slug,
        value: template.slug,
      };
    }),
  });

  return chooseTemplate(templates, slug);
};

const safeJoin = (basePath: string, childPath: string) => {
  const cleanChildPath = childPath.replace(/^\/+/, "");
  const finalPath = path.resolve(basePath, cleanChildPath);
  const relativePath = path.relative(basePath, finalPath);
  const escapesBasePath =
    relativePath.startsWith("..") || path.isAbsolute(relativePath);

  if (escapesBasePath) {
    throw new Error(`Invalid output path: ${childPath}`);
  }

  return finalPath;
};

const make = async (
  templateOrName?: string,
  maybeName?: string,
  values: string[] = [],
  options: { at?: string } = {},
) => {
  const snooksPath = await findUp(".snooks", process.cwd());

  if (!snooksPath) {
    throw new Error("No .snooks directory found.");
  }

  const templates = await readTemplates(snooksPath);
  const config = await readPackageConfig(snooksPath);
  const hasExplicitName = Boolean(maybeName);
  const requestedTemplate = hasExplicitName
    ? templateOrName
    : undefined;
  const initialName = hasExplicitName ? maybeName : templateOrName;
  const template = await chooseTemplate(templates, requestedTemplate);
  const name = initialName || (await input({ message: "Name?" }));

  const baseArgs = {
    ...parseKeyValues(values),
    NAME: name,
    name,
  };

  const args = baseArgs;
  const rawOutputRoot = options.at || template.meta.output || ".";
  const outputRoot = path.resolve(
    process.cwd(),
    render(rawOutputRoot, args, config),
  );
  const files = extractFiles(template);

  for (const file of files) {
    const renderedOutput = render(file.output, args, config);
    const renderedContent = render(file.content, args, config);
    const filePath = safeJoin(outputRoot, renderedOutput);

    await fs.outputFile(filePath, renderedContent);

    console.log(`created ${path.relative(process.cwd(), filePath)}`);
  }
};

const program = new Command();

program
  .name("snooks")
  .description("Local markdown-based scaffolding")
  .version("0.0.1");

program
  .command("make")
  .argument("[templateOrName]")
  .argument("[name]")
  .argument("[values...]")
  .option("--at <path>")
  .action(make);

program.parse();
