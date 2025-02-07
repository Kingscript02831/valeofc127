
export const updateMetaTags = (
  title: string | null,
  description: string | null,
  author: string | null,
  image: string | null
) => {
  if (title) {
    document.title = title;
  }
  
  const metaTags = {
    description,
    author,
    'og:image': image,
  };

  Object.entries(metaTags).forEach(([name, content]) => {
    if (content) {
      // Update existing meta tag or create new one
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.querySelector(`meta[property="${name}"]`);
      }
      
      if (meta) {
        meta.setAttribute('content', content);
      } else {
        meta = document.createElement('meta');
        if (name.startsWith('og:')) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    }
  });
};

