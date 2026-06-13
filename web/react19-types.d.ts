import 'react';

declare module 'd3-array' {
  const _: any;
  export = _;
}

declare module 'd3-time-format' {
  const _: any;
  export = _;
}

declare global {
  namespace JSX {
    type Element = React.ReactElement;
    type IntrinsicElements = React.JSX.IntrinsicElements;
    type ElementType = React.JSX.ElementType;
    type ElementClass = React.JSX.ElementClass;
    type ElementAttributesProperty = React.JSX.ElementAttributesProperty;
    type ElementChildrenAttribute = React.JSX.ElementChildrenAttribute;
    type LibraryManagedAttributes<C, P> = React.JSX.LibraryManagedAttributes<C, P>;
    type IntrinsicAttributes = React.JSX.IntrinsicAttributes;
    type IntrinsicClassAttributes<T> = React.JSX.IntrinsicClassAttributes<T>;
  }
}
