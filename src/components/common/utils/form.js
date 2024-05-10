import { anyPass, isNil, isEmpty } from 'ramda';

export const isEmptyOrNull = anyPass([isNil, isEmpty]);