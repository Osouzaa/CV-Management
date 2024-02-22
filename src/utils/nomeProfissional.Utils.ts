export function formatarNomeProfissional(profissional: string): string {
    const codigoFormatado = profissional
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .join('.');
    return codigoFormatado;
  }
