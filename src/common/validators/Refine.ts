import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

const Refine = (validationFunction: (value, object) => boolean, validationOptions?: ValidationOptions) => {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: 'refine',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [validationFunction],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [validationFunction] = args.constraints;
          return validationFunction(value, args.object);
        },
      },
    });
  };
};
export default Refine;
