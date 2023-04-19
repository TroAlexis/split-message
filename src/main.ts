type Fragment = string[];

type SplitMessagesOptions = {
  limit?: number;
  separator?: string;
  getSuffix?: (index: number, total: number) => string;
};

export const SPLIT_MESSAGES_DEFAULT_OPTIONS: SplitMessagesOptions = {
  limit: 140,
  separator: ' ',
  getSuffix: (index, total) => `${index + 1}/${total}`,
};

const checkFitsIntoFragment = (
  fragment: Fragment,
  word: string,
  { separator, limit }: SplitMessagesOptions,
): boolean => {
  const extendedFragment = [...fragment, word].join(separator);

  return extendedFragment.length <= limit;
};

/* Разбивает сообщение на фрагменты по разделителю и лимиту с учетом суфикса */
export const getMessageFragments = (
  message: string,
  options: SplitMessagesOptions,
  total?: number,
): Fragment[] => {
  const { getSuffix, separator } = options;

  const words = message.split(separator);

  const messageFragments = words.reduce<Fragment[]>((fragments, word) => {
    const lastFragmentIndex = fragments.length - 1;
    const lastFragment = fragments[lastFragmentIndex];

    if (!lastFragment) {
      return [[word]];
    }

    const suffix = getSuffix?.(lastFragmentIndex, total);
    const wordWithSuffix = suffix ? [word, suffix].join(separator) : word;

    if (checkFitsIntoFragment(lastFragment, wordWithSuffix, options)) {
      lastFragment.push(word);
    } else {
      fragments.push([word]);
    }

    return fragments;
  }, []);

  /* Проставляем суффиксы, если больше одного фрагмента */
  if (getSuffix && total > 1) {
    messageFragments.forEach((fragment, index) => {
      const suffix = getSuffix(index, total);
      fragment.push(suffix);
    });
  }

  return messageFragments;
};

export const splitMessageIntoParts = (
  text: string,
  options: SplitMessagesOptions = {},
): string[] => {
  const config = { ...SPLIT_MESSAGES_DEFAULT_OPTIONS, ...options };
  const { getSuffix: omitted, ...baseConfig } = config;

  /* Получаем количество фрагментов текущей конфигурации без суфиксов */
  let fragments = getMessageFragments(text, baseConfig);
  let totalFragments = fragments.length;

  /* Получаем фрагменты с проставленными суфиксами */
  fragments = getMessageFragments(text, config, totalFragments);

  /**
   * Если количество фрагментов изменилось - нужно пересобрать с актуальным суфиксом
   * пока количество фрагментов с прошлой итерации не станет равным текущему
   */
  while (totalFragments < fragments.length) {
    totalFragments = fragments.length;
    fragments = getMessageFragments(text, config, totalFragments);
  }

  /* Собираем фрагменты в сообщения */
  return fragments.map((f) => f.join(config.separator));
};
