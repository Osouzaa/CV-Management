export function formatarTelefone(telefone: string): string {
    const numeroLimpo = telefone.replace(/\D/g, '');
    if (numeroLimpo.length === 11) {
      return `(${numeroLimpo.substring(0, 2)}) ${numeroLimpo.substring(2, 7)}-${numeroLimpo.substring(7)}`;
    } else {
      return telefone;
    }
  }
  