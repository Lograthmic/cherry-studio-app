import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { CloseHeader } from '@/components/headers';
import {
  getNextModelSelection,
  isModelPickerTarget,
  MODEL_SETTING_KIND_TITLE_KEYS,
  MODEL_SETTING_OPTIONS,
  ModelPickerSheetContent,
  type ModelSettingOption,
  useModelSettingSelections,
} from '@/components/settings/model';

export default function ModelPickerScreen() {
  const { target } = useLocalSearchParams<{ target?: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const modelSettings = useModelSettingSelections();
  const validTarget = isModelPickerTarget(target) ? target : undefined;

  const closeSheet = useCallback(() => {
    router.back();
  }, [router]);

  const handleModelPress = useCallback(
    (option: ModelSettingOption) => {
      if (!validTarget) {
        return;
      }

      const nextModelId = getNextModelSelection(modelSettings.selections[validTarget], option.id);

      modelSettings.onSelectionChange(validTarget, nextModelId);
      closeSheet();
    },
    [closeSheet, modelSettings, validTarget],
  );

  if (!validTarget) {
    return <Redirect href="/settings/model" />;
  }

  return (
    <>
      <CloseHeader title={t(MODEL_SETTING_KIND_TITLE_KEYS[validTarget])} />
      <ModelPickerSheetContent
        options={MODEL_SETTING_OPTIONS}
        selectedModelId={modelSettings.selections[validTarget]}
        onSelect={handleModelPress}
      />
    </>
  );
}
