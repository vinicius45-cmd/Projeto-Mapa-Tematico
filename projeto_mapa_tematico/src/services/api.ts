export const buscarLinhasSITURB = async () => {
  try {
    const response = await fetch('http://localhost:3000/linhas');
    
    if (!response.ok) {
      console.error(`Erro servidor: ${response.status}`);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error("Erro na requisição:", error);
    return [];
  }
};