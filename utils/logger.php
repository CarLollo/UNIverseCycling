<?php

class Logger {
    private $logFile;
    
    public function __construct($logFile) {
        $this->logFile = $logFile;
        
        // Crea la directory dei log se non esiste
        $logDir = dirname($logFile);
        if (!file_exists($logDir)) {
            if (!mkdir($logDir, 0777, true)) {
                error_log("LOGGER: Impossibile creare la directory $logDir");
            } else {
                error_log("LOGGER: Directory $logDir creata");
            }
        }
        
        // Crea il file se non esiste
        if (!file_exists($logFile)) {
            if (touch($logFile)) {
                chmod($logFile, 0777);
                error_log("LOGGER: File $logFile creato");
            } else {
                error_log("LOGGER: Impossibile creare il file $logFile");
            }
        }
        
        // Verifica i permessi
        if (!is_writable($logFile)) {
            error_log("LOGGER: Il file $logFile non è scrivibile");
            chmod($logFile, 0777);
        }
    }
    
    public function log($message) {
        $timestamp = date('Y-m-d H:i:s');
        $formattedMessage = "[$timestamp] $message\n";
        
        if (file_put_contents($this->logFile, $formattedMessage, FILE_APPEND)) {
            error_log("LOGGER: Messaggio scritto: $message");
        } else {
            error_log("LOGGER: Impossibile scrivere il messaggio: $message");
        }
    }
}
