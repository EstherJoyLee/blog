const Head = () => {
  return (
    <>
      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="//googleapis.com" />
      <link rel="dns-prefetch" href="//identitytoolkit.googleapis.com" />
      <link rel="dns-prefetch" href="//firestore.googleapis.com" />

      {/* Preconnect */}
      <link rel="preconnect" href="https://googleapis.com" crossOrigin="" />
      <link
        rel="preconnect"
        href="https://identitytoolkit.googleapis.com"
        crossOrigin=""
      />
      <link
        rel="preconnect"
        href="https://firestore.googleapis.com"
        crossOrigin=""
      />
    </>
  );
};

export default Head;
