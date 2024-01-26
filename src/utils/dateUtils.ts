export function formatarDataNascimento(dataNascimentoTimestamp: number): string {
    const dataNascimento = new Date(1900, 0, dataNascimentoTimestamp);
    dataNascimento.setDate(dataNascimento.getDate() - 1);
    return dataNascimento.toISOString().split('T')[0];
  }