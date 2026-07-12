import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";

const ORANGE = "#F47A21";

interface PdfPickerProps {
  onPicked?: (file: { name: string; uri: string; size: number }) => void;
}

export default function PdfPicker({ onPicked }: PdfPickerProps) {
  const [pickedFile, setPickedFile] = useState<{
    name: string;
    uri: string;
    size: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const pickPdf = async () => {
    try {
      setLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setLoading(false);
        return;
      }

      const file = result.assets[0];
      const fileInfo = {
        name: file.name,
        uri: file.uri,
        size: file.size ?? 0,
      };

      setPickedFile(fileInfo);
      onPicked?.(fileInfo);
    } catch (error) {
      Alert.alert("Error", "Failed to pick PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.pickButton, loading && styles.pickButtonDisabled]}
        onPress={pickPdf}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color={ORANGE} />
        ) : (
          <>
            <Text style={styles.pickIcon}>📄</Text>
            <View style={styles.pickTextWrap}>
              <Text style={styles.pickTitle}>
                {pickedFile ? "Change PDF" : "Pick a PDF"}
              </Text>
              <Text style={styles.pickSubtitle}>
                Tap to browse your device
              </Text>
            </View>
          </>
        )}
      </Pressable>

      {pickedFile && (
        <View style={styles.fileCard}>
          <View style={styles.fileIcon}>
            <Text style={styles.fileIconText}>PDF</Text>
          </View>
          <View style={styles.fileInfo}>
            <Text style={styles.fileName} numberOfLines={1}>
              {pickedFile.name}
            </Text>
            <Text style={styles.fileSize}>{formatSize(pickedFile.size)}</Text>
          </View>
          <Pressable style={styles.removeButton} onPress={() => setPickedFile(null)}>
            <Text style={styles.removeText}>✕</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  pickButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#E0D6D0",
  },
  pickButtonDisabled: { opacity: 0.5 },
  pickIcon: { fontSize: 28, marginRight: 12 },
  pickTextWrap: { flex: 1 },
  pickTitle: { color: "#3F3732", fontSize: 15, fontWeight: "800" },
  pickSubtitle: { color: "#A69B94", fontSize: 12, marginTop: 2 },
  fileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    shadowColor: "#765E50",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  fileIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#FFE1CC",
    alignItems: "center",
    justifyContent: "center",
  },
  fileIconText: { color: ORANGE, fontSize: 12, fontWeight: "900" },
  fileInfo: { flex: 1, marginLeft: 12 },
  fileName: { color: "#3F3732", fontSize: 14, fontWeight: "700" },
  fileSize: { color: "#A69B94", fontSize: 12, marginTop: 2 },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F1EBE7",
    alignItems: "center",
    justifyContent: "center",
  },
  removeText: { color: "#8A817B", fontSize: 14, fontWeight: "700" },
});
