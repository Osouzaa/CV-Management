import { parse, differenceInYears } from "date-fns";

export const calcularIdade = (data_de_nascimento: string) => {
  const dataNascimento = parse(data_de_nascimento, 'yyyy-MM-dd', new Date());
  const idade = differenceInYears(new Date(), dataNascimento);

  return idade;
};
