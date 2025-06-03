const fs = require('fs/promises');
const path = require('path');
const { execSync } = require('child_process');

const languages = [
  'ca',
  'de',
  'es',
  'fr',
  'hu',
  'it',
  'ja',
  'ko',
  'pt',
  'ru',
  'zh',
];

let srcPaths = ['apps/router/src/languages'];
const targetKey = false;

async function installOpenAI() {
  console.log('Installing OpenAI package...');
  execSync('yarn add openai --ignore-workspace-root-check', {
    stdio: 'inherit',
  });
}

async function uninstallOpenAI() {
  console.log('Uninstalling OpenAI package...');
  execSync('yarn remove openai --ignore-workspace-root-check', {
    stdio: 'inherit',
  });
}

function flattenObject(obj, prefix = '') {
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + '.' : '';
    if (
      typeof obj[k] === 'object' &&
      obj[k] !== null &&
      !Array.isArray(obj[k])
    ) {
      Object.assign(acc, flattenObject(obj[k], pre + k));
    } else {
      acc[pre + k] = obj[k];
    }
    return acc;
  }, {});
}

function unflattenObject(obj) {
  const result = {};
  for (const key in obj) {
    const keys = key.split('.');
    let current = result;
    for (let i = 0; i < keys.length; i++) {
      if (i === keys.length - 1) {
        current[keys[i]] = obj[key];
      } else {
        current[keys[i]] = current[keys[i]] || {};
        current = current[keys[i]];
      }
    }
  }
  return result;
}

async function translateAndFill(openaiInstance) {
  try {
    for (const srcPath of srcPaths) {
      const srcFile = `${srcPath}/en.json`;
      const srcData = JSON.parse(await fs.readFile(srcFile, 'utf8'));

      for (const lang of languages) {
        const targetFile = path.join(srcPath, `${lang}.json`);
        let targetData = {};
        try {
          targetData = JSON.parse(await fs.readFile(targetFile, 'utf8'));
        } catch (error) {
          console.log(`Creating new file for language: ${lang}`);
        }

        if (targetKey) {
          const keys = targetKey.split('.');
          const dataToTranslate = keys.reduce(
            (obj, key) => obj && obj[key],
            srcData
          );

          if (dataToTranslate === undefined) {
            console.error(`Key not found in source: ${targetKey}`);
            continue;
          }

          console.log(`Translating key: ${targetKey}`);
          const translation = await translateWithOpenAI(
            dataToTranslate,
            lang,
            openaiInstance
          );

          // Update the specific key in the target data
          let current = targetData;
          for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current = current[keys[i]];
          }
          current[keys[keys.length - 1]] = translation;
        } else {
          targetData = await fillMissingKeys(
            srcData,
            targetData,
            lang,
            openaiInstance
          );
        }

        await fs.writeFile(
          targetFile,
          JSON.stringify(targetData, null, 2),
          'utf8'
        );
        console.log(`Updated/created file for language: ${lang}`);
      }
    }
  } catch (error) {
    console.error('Error processing translation:', error);
  }
}

async function fillMissingKeys(srcObj, targetObj, lang, openaiInstance) {
  const updatedObj = { ...targetObj };
  for (const key in srcObj) {
    if (isStringObject(srcObj[key])) {
      const srcString = objectToString(srcObj[key]);
      if (updatedObj[key] === undefined) {
        console.log(`Translating key: ${key}`);
        await retryWithExponentialBackoff(async () => {
          const translation = await translateWithOpenAI(
            srcString,
            lang,
            openaiInstance
          );
          updatedObj[key] = translation;
        });
      } else {
        console.log(`Skipping key: ${key} (already exists)`);
      }
    } else if (typeof srcObj[key] === 'object' && srcObj[key] !== null) {
      updatedObj[key] = await fillMissingKeys(
        srcObj[key],
        updatedObj[key] || {},
        lang,
        openaiInstance
      );
    } else if (updatedObj[key] === undefined) {
      console.log(`Translating key: ${key}`);
      await retryWithExponentialBackoff(async () => {
        const translation = await translateWithOpenAI(
          srcObj[key],
          lang,
          openaiInstance
        );
        updatedObj[key] = translation;
      });
    } else {
      console.log(`Skipping key: ${key} (already exists)`);
    }
  }
  return updatedObj;
}

function isStringObject(obj) {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    Object.keys(obj).every((key) => !Number.isNaN(parseInt(key)))
  );
}

function objectToString(obj) {
  return Object.values(obj).join('');
}

async function translateWithOpenAI(text, targetLang, openaiInstance) {
  const prompt = `Translate the following text to ${targetLang}. Return only the translated string, without any additional text or explanations:\n\n${text}`;

  const response = await openaiInstance.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    stream: false,
  });

  if (response?.choices?.[0]?.message?.content) {
    return response.choices[0].message.content
      .trim()
      .replace(/^["']|["']$/g, '');
  } else {
    throw new Error('Unexpected response format from OpenAI API');
  }
}

async function retryWithExponentialBackoff(
  operation,
  maxRetries = 100,
  baseDelay = 1000
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await operation();
      return;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      if (attempt === maxRetries) {
        throw error;
      }
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      console.log(`Retrying in ${Math.round(delay / 1000)} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

async function main() {
  try {
    await installOpenAI();
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    await translateAndFill(openai);
  } finally {
    await uninstallOpenAI();
  }
}

main();
