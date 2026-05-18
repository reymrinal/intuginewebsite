"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import DemoModal from "./DemoModal";

interface ModalContextType {
  openModal: (opts?: { utmContent?: string; utmCampaign?: string; utmSource?: string }) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType>({
  openModal: () => {},
  closeModal: () => {},
});

export function useModal() {
  return useContext(ModalContext);
}

export function DemoModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [opts, setOpts] = useState<{ utmContent?: string; utmCampaign?: string; utmSource?: string }>({});

  const openModal = useCallback((options?: { utmContent?: string; utmCampaign?: string; utmSource?: string }) => {
    setOpts(options || {});
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => setIsOpen(false), []);

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <DemoModal
        isOpen={isOpen}
        onClose={closeModal}
        utmSource={opts.utmSource || "library"}
        utmMedium="content_cta"
        utmCampaign={opts.utmCampaign || "library_content"}
        utmContent={opts.utmContent || "unknown"}
      />
    </ModalContext.Provider>
  );
}
