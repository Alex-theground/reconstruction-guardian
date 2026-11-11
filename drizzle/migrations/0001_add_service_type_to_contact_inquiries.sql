ALTER TABLE public.contact_inquiries ADD COLUMN service_type TEXT;
COMMENT ON COLUMN public.contact_inquiries.service_type IS '상담 희망 업무 구분 (예: 재건축·재개발 조합 운영 감독, 아파트 관리 감사)';