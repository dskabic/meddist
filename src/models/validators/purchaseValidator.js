function validateCartMutation(articleId, quantity) {
  const errors = [];

  if (!Number.isInteger(Number(articleId)) || Number(articleId) <= 0) {
    errors.push("Potrebno je odabrati valjan artikl.");
  }

  if (!Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
    errors.push("Količina mora biti pozitivan cijeli broj.");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function validateCheckoutItems(items) {
  const errors = [];

  if (!Array.isArray(items) || items.length === 0) {
    errors.push("Narudžba mora sadržavati barem jednu stavku.");
  }

  const seenArticleIds = new Set();

  for (const item of items || []) {
    if (!Number.isInteger(Number(item.articleId)) || Number(item.articleId) <= 0) {
      errors.push("Narudžba sadrži neispravan artikl.");
      continue;
    }

    if (seenArticleIds.has(Number(item.articleId))) {
      errors.push(`Artikl ID ${item.articleId} ne može biti dodan više puta u istoj narudžbi.`);
    }
    seenArticleIds.add(Number(item.articleId));

    if (!Number.isInteger(Number(item.quantity)) || Number(item.quantity) <= 0) {
      errors.push(`Količina za artikl ID ${item.articleId} mora biti pozitivan cijeli broj.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateCartMutation,
  validateCheckoutItems
};
