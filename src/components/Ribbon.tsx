import React from 'react';
import { ActiveTab, SlideElement, TransitionType, PresentationTheme, ElementAnimationType } from '../types/presentation';
import { InsertRibbon } from './InsertRibbon';
import { HomeRibbon } from './HomeRibbon';
import { DesignRibbon } from './DesignRibbon';
import { TransitionsRibbon, SlideShowRibbon, HelpRibbon } from './OtherRibbons';
import { AnimationsRibbon } from './AnimationsRibbon';

interface RibbonProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  // Home props
  selectedElement: SlideElement | null;
  onUpdateElement: (updated: Partial<SlideElement>) => void;
  onDeleteElement: () => void;
  onDuplicateElement: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onAddSlide: (layout?: string) => void;
  onSave?: () => void;
  // Insert props
  onOpenTablePicker: () => void;
  onOpenImagePicker: () => void;
  onAddCameo: () => void;
  onOpenShapePicker: () => void;
  onOpenIconPicker: () => void;
  onOpenSmartArtPicker: () => void;
  onOpenChartPicker: () => void;
  onAddTextBox: () => void;
  onAddWordArt: () => void;
  onOpenMathFormula: () => void;
  onOpenSymbolPicker: () => void;
  onOpenMultimedia: (tab?: 'video-file' | 'video-online' | 'audio' | 'link') => void;
  onAddVideo: () => void;
  onAddAudio: () => void;
  onAddComment: () => void;
  onToggleCameo: () => void;
  hasCameo: boolean;
  // Design props
  currentThemeId: string;
  onSelectTheme: (theme: PresentationTheme) => void;
  aspectRatio: '16:9' | '4:3';
  onChangeAspectRatio: (ratio: '16:9' | '4:3') => void;
  currentSlideBg?: string;
  onChangeSlideBg: (color: string) => void;
  // Transitions props
  currentTransition?: TransitionType;
  onChangeTransition: (trans: TransitionType) => void;
  onApplyToAllTransitions: () => void;
  // Animations props
  slideElements?: SlideElement[];
  onApplyToAllAnimations?: (anim: ElementAnimationType) => void;
  onClearAllAnimations?: () => void;
  onPreviewAnimation?: (elementId?: string) => void;
  onMoveAnimationOrder?: (elementId: string, direction: 'earlier' | 'later') => void;
  // Slide Show props
  onStartFromBeginning: () => void;
  onStartFromCurrent: () => void;
  onPresenterMode: () => void;
  onTriggerConfetti: () => void;
  onOpenRepository: () => void;
  onOpenImportPptx?: () => void;
}

export const Ribbon: React.FC<RibbonProps> = ({
  activeTab,
  onSelectTab,
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onBringForward,
  onSendBackward,
  onAddSlide,
  onSave,
  onOpenTablePicker,
  onOpenImagePicker,
  onAddCameo,
  onOpenShapePicker,
  onOpenIconPicker,
  onOpenSmartArtPicker,
  onOpenChartPicker,
  onAddTextBox,
  onAddWordArt,
  onOpenMathFormula,
  onOpenSymbolPicker,
  onOpenMultimedia,
  onAddVideo,
  onAddAudio,
  onAddComment,
  onToggleCameo,
  hasCameo,
  currentThemeId,
  onSelectTheme,
  aspectRatio,
  onChangeAspectRatio,
  currentSlideBg,
  onChangeSlideBg,
  currentTransition,
  onChangeTransition,
  onApplyToAllTransitions,
  slideElements = [],
  onApplyToAllAnimations = () => {},
  onClearAllAnimations = () => {},
  onPreviewAnimation = () => {},
  onMoveAnimationOrder = () => {},
  onStartFromBeginning,
  onStartFromCurrent,
  onPresenterMode,
  onTriggerConfetti,
  onOpenRepository,
  onOpenImportPptx
}) => {
  const tabs: { id: ActiveTab; label: string; highlight?: boolean }[] = [
    { id: 'file', label: 'Tệp' },
    { id: 'home', label: 'Trang chủ' },
    { id: 'insert', label: 'Chèn' }, // Highlighted in user's image!
    { id: 'design', label: 'Thiết kế' },
    { id: 'transitions', label: 'Chuyển tiếp' },
    { id: 'animations', label: 'Hiệu ứng' },
    { id: 'slideshow', label: 'Trình chiếu' },
    { id: 'repository', label: 'Bài giảng', highlight: true },
    { id: 'help', label: 'Trợ giúp' }
  ];

  return (
    <div className="flex flex-col bg-[#f3f4f6] select-none border-b border-[#dadce0] shrink-0">
      {/* Tab Navigation Headers */}
      <div className="flex items-center px-2 bg-white border-b border-[#dadce0] text-xs font-medium text-slate-700 h-8">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'file' || tab.id === 'repository') {
                  onOpenRepository();
                } else {
                  onSelectTab(tab.id);
                }
              }}
              className={`px-3.5 h-full flex items-center transition relative ${
                isActive
                  ? 'text-[#c43e1c] font-bold border-b-2 border-[#c43e1c] bg-[#f8f9fa]'
                  : 'hover:bg-slate-100 hover:text-slate-900'
              } ${tab.highlight ? 'bg-amber-50/80 text-amber-800 font-semibold' : ''}`}
            >
              {tab.label}
              {tab.highlight && (
                <span className="ml-1 w-2 h-2 rounded-full bg-amber-500 inline-block animate-ping"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tab Ribbon Content */}
      <div className="w-full">
        {activeTab === 'home' && (
          <HomeRibbon
            selectedElement={selectedElement}
            onUpdateElement={onUpdateElement}
            onDeleteElement={onDeleteElement}
            onDuplicateElement={onDuplicateElement}
            onBringForward={onBringForward}
            onSendBackward={onSendBackward}
            onAddSlide={onAddSlide}
            onOpenImportPptx={onOpenImportPptx}
            onSave={onSave}
          />
        )}

        {activeTab === 'insert' && (
          <InsertRibbon
            onAddSlide={onAddSlide}
            onOpenTablePicker={onOpenTablePicker}
            onOpenImagePicker={onOpenImagePicker}
            onAddCameo={onAddCameo}
            onOpenShapePicker={onOpenShapePicker}
            onOpenIconPicker={onOpenIconPicker}
            onOpenSmartArtPicker={onOpenSmartArtPicker}
            onOpenChartPicker={onOpenChartPicker}
            onAddTextBox={onAddTextBox}
            onAddWordArt={onAddWordArt}
            onOpenMathFormula={onOpenMathFormula}
            onOpenSymbolPicker={onOpenSymbolPicker}
            onOpenMultimedia={onOpenMultimedia}
            onAddVideo={onAddVideo}
            onAddAudio={onAddAudio}
            onAddComment={onAddComment}
            onToggleCameo={onToggleCameo}
            hasCameo={hasCameo}
          />
        )}

        {activeTab === 'design' && (
          <DesignRibbon
            currentThemeId={currentThemeId}
            onSelectTheme={onSelectTheme}
            aspectRatio={aspectRatio}
            onChangeAspectRatio={onChangeAspectRatio}
            currentSlideBg={currentSlideBg}
            onChangeSlideBg={onChangeSlideBg}
          />
        )}

        {activeTab === 'transitions' && (
          <TransitionsRibbon
            currentTransition={currentTransition}
            onChangeTransition={onChangeTransition}
            onApplyToAll={onApplyToAllTransitions}
          />
        )}

        {activeTab === 'animations' && (
          <AnimationsRibbon
            selectedElement={selectedElement}
            onUpdateElement={onUpdateElement}
            slideElements={slideElements}
            onApplyToAllElements={onApplyToAllAnimations}
            onClearAllAnimations={onClearAllAnimations}
            onPreviewAnimation={onPreviewAnimation}
            onMoveOrder={onMoveAnimationOrder}
          />
        )}

        {activeTab === 'slideshow' && (
          <SlideShowRibbon
            onStartFromBeginning={onStartFromBeginning}
            onStartFromCurrent={onStartFromCurrent}
            onPresenterMode={onPresenterMode}
            onTriggerConfetti={onTriggerConfetti}
            onOpenImportPptx={onOpenImportPptx}
          />
        )}

        {activeTab === 'help' && (
          <HelpRibbon onOpenRepository={onOpenRepository} />
        )}
      </div>
    </div>
  );
};
