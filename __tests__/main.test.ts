import {
  SPLIT_MESSAGES_DEFAULT_OPTIONS,
  splitMessageIntoParts,
} from '../src/main.js';
import { faker } from '@faker-js/faker';

describe('splitMessageIntoParts', () => {
  const checkMessagesLimit = (messages: string[]): void => {
    messages.forEach((item) => {
      expect(item.length).toBeLessThanOrEqual(
        SPLIT_MESSAGES_DEFAULT_OPTIONS.limit,
      );
    });
  };

  it('возвращает элемент без суфикса, если помещается в один фрагмент', () => {
    const text = 'Lorem ipsum dolor sit amet consectetur adipiscing elit';
    const result = splitMessageIntoParts(text);

    checkMessagesLimit(result);
    expect(result).toEqual([
      'Lorem ipsum dolor sit amet consectetur adipiscing elit',
    ]);
  });

  it('возвращает элементы с суфиксом при наличии нескольких фрагментов', () => {
    const text =
      'Lorem ipsum dolor sit amet consectetur adipiscing elit Nullam eleifend odio at magna pretium suscipit Nam commodo mauris felis ut suscipit velit efficitur eget Sed sit amet posuere risus';
    const result = splitMessageIntoParts(text);

    checkMessagesLimit(result);
    expect(result).toEqual([
      'Lorem ipsum dolor sit amet consectetur adipiscing elit Nullam eleifend odio at magna pretium suscipit Nam commodo mauris felis ut 1/2',
      'suscipit velit efficitur eget Sed sit amet posuere risus 2/2',
    ]);
  });

  it('корректно обрабатывает большие сообщения с потенциальным сдвигом из-за длины суфикса', () => {
    const text = faker.lorem.words(100000);
    const result = splitMessageIntoParts(text);

    checkMessagesLimit(result);
  });
});
