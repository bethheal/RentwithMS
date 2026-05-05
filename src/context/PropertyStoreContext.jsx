import { createContext, useContext, useEffect, useState } from "react";
import { initialManagedProperties } from "../data/mockApi/managedProperties.js";
import { buildManagedPropertyRecord } from "../utils/propertyRecords.js";

const STORAGE_KEY = "RMS-managed-properties";
const PropertyStoreContext = createContext(null);

function sortManagedProperties(properties) {
  return [...properties].sort((left, right) => {
    const leftTime = new Date(left.updatedAt ?? left.createdAt ?? 0).getTime();
    const rightTime = new Date(right.updatedAt ?? right.createdAt ?? 0).getTime();

    return rightTime - leftTime;
  });
}

function getInitialManagedProperties() {
  if (typeof window === "undefined") {
    return sortManagedProperties(initialManagedProperties);
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    return sortManagedProperties(initialManagedProperties);
  }

  try {
    const parsedValue = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return sortManagedProperties(initialManagedProperties);
    }

    return sortManagedProperties(parsedValue);
  } catch {
    return sortManagedProperties(initialManagedProperties);
  }
}

export function PropertyStoreProvider({ children }) {
  const [properties, setProperties] = useState(getInitialManagedProperties);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleStorage = (event) => {
      if (event.key !== STORAGE_KEY || !event.newValue) {
        return;
      }

      try {
        const parsedValue = JSON.parse(event.newValue);

        if (Array.isArray(parsedValue)) {
          setProperties(sortManagedProperties(parsedValue));
        }
      } catch {
        setProperties(sortManagedProperties(initialManagedProperties));
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const savePropertyDraft = ({ draft, fallbackPreview, landlord, propertyId }) => {
    const existingProperty =
      properties.find((property) => property.id === propertyId) ?? null;
    const nextProperty = buildManagedPropertyRecord({
      draft,
      existingProperty,
      fallbackPreview,
      landlord,
    });

    setProperties((currentProperties) =>
      sortManagedProperties([
        nextProperty,
        ...currentProperties.filter((property) => property.id !== nextProperty.id),
      ])
    );

    return nextProperty;
  };

  const publishProperty = (propertyId, baseProperty = null) => {
    const existingProperty =
      properties.find((property) => property.id === propertyId) ?? baseProperty;

    if (!existingProperty) {
      return null;
    }

    const now = new Date().toISOString();
    const publishedProperty = {
      ...existingProperty,
      workflowStatus: "published",
      publishedAt: existingProperty.publishedAt ?? now,
      updatedAt: now,
    };

    setProperties((currentProperties) =>
      currentProperties.some((property) => property.id === propertyId)
        ? sortManagedProperties(
            currentProperties.map((property) =>
              property.id === propertyId ? publishedProperty : property
            )
          )
        : sortManagedProperties([publishedProperty, ...currentProperties])
    );

    return publishedProperty;
  };

  const unpublishProperty = (propertyId) => {
    const existingProperty =
      properties.find((property) => property.id === propertyId) ?? null;

    if (!existingProperty) {
      return null;
    }

    const unpublishedProperty = {
      ...existingProperty,
      workflowStatus: "unpublished",
      updatedAt: new Date().toISOString(),
    };

    setProperties((currentProperties) =>
      sortManagedProperties(
        currentProperties.map((property) =>
          property.id === propertyId ? unpublishedProperty : property
        )
      )
    );

    return unpublishedProperty;
  };

  const deleteProperty = (propertyId) => {
    const deletedProperty =
      properties.find((property) => property.id === propertyId) ?? null;

    setProperties((currentProperties) =>
      sortManagedProperties(
        currentProperties.filter((property) => property.id !== propertyId)
      )
    );

    return deletedProperty;
  };

  return (
    <PropertyStoreContext.Provider
      value={{
        deleteProperty,
        properties,
        publishProperty,
        savePropertyDraft,
        unpublishProperty,
      }}
    >
      {children}
    </PropertyStoreContext.Provider>
  );
}

export function usePropertyStore() {
  const context = useContext(PropertyStoreContext);

  if (!context) {
    throw new Error("usePropertyStore must be used within PropertyStoreProvider");
  }

  return context;
}
