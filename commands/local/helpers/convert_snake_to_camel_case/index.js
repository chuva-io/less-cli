const convert_snake_to_camel_case = (str) => {
  const words = str.split('_');

  const camel_case = words.map(word => `${word[0].toUpperCase()}${word.substring(1)}`);

  return camel_case.join('');
}

export default convert_snake_to_camel_case