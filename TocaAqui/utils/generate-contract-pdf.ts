import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { fillContractTemplate } from "@/utils/contract-template";
import type { ContractTemplateData } from "@/types/contractPdf";

export async function generateContractPdfUri(data: ContractTemplateData): Promise<string> {
  const html = fillContractTemplate(data);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  return uri;
}

export async function downloadContractPdf(data: ContractTemplateData): Promise<string> {
  const uri = await generateContractPdfUri(data);
  const fileName = `contrato-toca-aqui-${data.refContrato}.pdf`;
  const dest = `${FileSystem.documentDirectory}${fileName}`;
  await FileSystem.copyAsync({ from: uri, to: dest });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(dest, {
      mimeType: "application/pdf",
      dialogTitle: "Baixar Contrato",
      UTI: "com.adobe.pdf",
    });
  }

  return dest;
}

export async function readFileAsBase64(uri: string): Promise<string> {
  return FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
}
