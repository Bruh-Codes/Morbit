import React from 'react';

export const t = (strings: TemplateStringsArray | string, ...values: any[]): string => {
  if (typeof strings === 'string') return strings;
  let out = '';
  for (let i = 0; i < strings.length; i++) {
    out += strings[i];
    if (i < values.length) out += String(values[i]);
  }
  return out;
};

export const Trans = (props: any) => {
  const { children, ...rest } = props;
  return React.createElement('span', rest, children || props.id || '');
};

export const Plural = (props: any) => React.createElement('span', null, props.id || '');
export const Select = (props: any) => React.createElement('span', null, props.id || '');
export const SelectOrdinal = (props: any) => React.createElement('span', null, props.id || '');
