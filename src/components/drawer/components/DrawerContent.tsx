import { useCallback, useEffect, useRef } from 'react';
import { TextInput, useWindowDimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDrawerActions, useDrawerPanelState } from '../context/DrawerProvider';
import { useDrawerHeaderAnimation } from '../hooks/useDrawerHeaderAnimation';
import { drawerContentLayoutTransition } from '../utils/drawerAnimation';
import { DrawerHeader } from './DrawerHeader';
import { DrawerTopicList } from './DrawerTopicList';

export function DrawerContent() {
  const inputRef = useRef<TextInput>(null);
  const { width } = useWindowDimensions();
  const { isOpen, isSearchActive, searchText } = useDrawerPanelState();
  const { closeSearch, openSearch, setSearchText } = useDrawerActions();
  const isSearchVisible = isOpen && isSearchActive;
  const {
    closeButtonSize,
    closeButtonStyle,
    collapsedHeaderStyle,
    searchFieldIconStyle,
    searchFieldSlotStyle,
  } = useDrawerHeaderAnimation({
    isSearchActive: isSearchVisible,
    screenWidth: width,
  });

  // TODO(android): Verify system back closes the drawer and preserves search state.
  useEffect(() => {
    if (isSearchVisible) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isSearchVisible]);

  const handleSearchPress = useCallback(() => {
    openSearch();
  }, [openSearch]);

  const handleClose = useCallback(() => {
    inputRef.current?.blur();
    closeSearch();
  }, [closeSearch]);

  return (
    <SafeAreaView
      accessibilityElementsHidden={!isOpen}
      className="flex-1"
      edges={['top', 'bottom']}
      importantForAccessibility={isOpen ? 'auto' : 'no-hide-descendants'}
    >
      <Animated.View className="flex-1 gap-2" layout={drawerContentLayoutTransition}>
        <DrawerHeader
          closeButtonSize={closeButtonSize}
          closeButtonStyle={closeButtonStyle}
          collapsedHeaderStyle={collapsedHeaderStyle}
          inputRef={inputRef}
          isSearchVisible={isSearchVisible}
          onClose={handleClose}
          onSearchPress={handleSearchPress}
          searchFieldIconStyle={searchFieldIconStyle}
          searchFieldSlotStyle={searchFieldSlotStyle}
          searchText={searchText}
          setSearchText={setSearchText}
        />
        <Animated.View className="flex-1" layout={drawerContentLayoutTransition}>
          <DrawerTopicList />
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}
