    if (!auth.currentUser) {
      return {
        success: false,
        message:
          "Inicia sesión con Firebase Authentication antes de sincronizar.",
      };
    }

    try {
      this.updateStatus("syncing");
      await this.processPendingQueue();

      if (this.activeUser) {
        const saved = await this.saveUserProfile(this.activeUser);

        if (!saved) {
          return {
            success: false,
            message: "No se pudo guardar el perfil en Firestore.",
          };
        }
      }

      this.lastSyncTime = new Date().toISOString();
      this.updateStatus("cloud_connected");

      return {
        success: true,
        message: `Sincronización finalizada. Pendientes: ${this.pendingQueue.length}.`,
      };
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      console.error("Error durante sincronización manual:", error);
      this.updateStatus("local_mode");

      return {
        success: false,
        message,
      };
    }
  }

  /**
   * Sube un archivo a Cloud Storage y devuelve su URL de descarga.
   * La ruta queda separada por UID para facilitar las reglas de seguridad.
   */
  public static async uploadFile(
    file: File,
    path: string,
  ): Promise<{ fullPath: string; downloadURL: string }> {
    if (!storage) {
      throw new Error("Firebase Storage no está inicializado.");
    }

    const uid = this.requireAuthenticatedUid();
    const safePath = path.replace(/^\/+/, "");
    const fileRef = ref(storage, `users/${uid}/${safePath}`);

    const result = await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(result.ref);

    return {
      fullPath: result.ref.fullPath,
      downloadURL,
    };
  }

  /**
   * Crea un documento individual en Firestore.
   */
  public static async createRecord(
    collectionName: (typeof OFFICIAL_COLLECTIONS)[number],
    data: Record<string, unknown>,
  ): Promise<string> {
    const db = this.requireFirestore();
    const uid = this.requireAuthenticatedUid();

    const recordRef = await addDoc(collection(db, collectionName), {
      ...data,
      ownerUid: uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const verification = await getDoc(recordRef);

    if (!verification.exists()) {
      throw new Error(
        `No se pudo verificar ${collectionName}/${recordRef.id}.`,
      );
    }

    return recordRef.id;
  }

  /**
   * Actualiza un documento individual de Firestore.
   */
  public static async updateRecord(
    collectionName: (typeof OFFICIAL_COLLECTIONS)[number],
    recordId: string,
    changes: Record<string, unknown>,
  ): Promise<void> {
    const db = this.requireFirestore();
    const uid = this.requireAuthenticatedUid();
    const recordRef = doc(db, collectionName, recordId);
    const snapshot = await getDoc(recordRef);

    if (!snapshot.exists()) {
      throw new Error("El registro que intentas actualizar no existe.");
    }

    if (snapshot.data().ownerUid !== uid) {
      throw new Error("No tienes permiso para modificar este registro.");
    }

    await updateDoc(recordRef, {
      ...changes,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Elimina un documento individual de Firestore.
   */
  public static async deleteRecord(
    collectionName: (typeof OFFICIAL_COLLECTIONS)[number],
    recordId: string,
  ): Promise<void> {
    const db = this.requireFirestore();
    const uid = this.requireAuthenticatedUid();
    const recordRef = doc(db, collectionName, recordId);
    const snapshot = await getDoc(recordRef);

    if (!snapshot.exists()) {
      throw new Error("El registro que intentas eliminar no existe.");
    }

    if (snapshot.data().ownerUid !== uid) {
      throw new Error("No tienes permiso para eliminar este registro.");
    }

    await deleteDoc(recordRef);
  }
}
