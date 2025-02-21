
ALTER TABLE public.site_configuration 
ADD COLUMN basic_info_update_interval integer DEFAULT 30;

COMMENT ON COLUMN public.site_configuration.basic_info_update_interval IS 'Interval in days for allowing basic info updates';
