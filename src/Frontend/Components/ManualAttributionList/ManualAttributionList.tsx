// SPDX-FileCopyrightText: Meta Platforms, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0

import React, { ReactElement } from 'react';
import { Attributions } from '../../../shared/shared-types';
import { getAlphabeticalComparer } from '../../util/get-alphabetical-comparer';
import { List } from '../List/List';
import { PackageCard } from '../PackageCard/PackageCard';
import { PackageCardConfig } from '../../types/types';

const addNewAttributionButtonText = 'Add new attribution';
const addNewAttributionButtonId = 'ADD_NEW_ATTRIBUTION_ID';

interface ManualAttributionListProps {
  selectedResourceId: string;
  attributions: Attributions;
  selectedAttributionId: string | null;
  onCardClick(attributionId: string, isButton?: boolean): void;
  isAddNewAttributionItemShown?: boolean;
  attributionsFromParent?: boolean;
}

export function ManualAttributionList(
  props: ManualAttributionListProps
): ReactElement {
  const attributions = { ...props.attributions };
  const attributionIds: Array<string> = Object.keys({
    ...props.attributions,
  }).sort(getAlphabeticalComparer(attributions));

  if (props.isAddNewAttributionItemShown) {
    attributions[addNewAttributionButtonId] = {
      packageName: addNewAttributionButtonText,
    };
    attributionIds.push(addNewAttributionButtonId);
  }

  function getAttributionCard(attributionId: string): ReactElement {
    const packageInfo = attributions[attributionId];
    const isButton = attributionId === addNewAttributionButtonId;

    function isSelected(): boolean {
      return (
        attributionId === props.selectedAttributionId ||
        Boolean(props.selectedAttributionId === '' && isButton)
      );
    }

    function onClick(): void {
      props.onCardClick(attributionId, isButton);
    }

    const cardConfig: PackageCardConfig = {
      isSelected: isSelected(),
      isPreSelected: Boolean(packageInfo.preSelected),
    };

    return (
      <PackageCard
        attributionId={isButton ? '' : attributionId}
        onClick={onClick}
        hideContextMenuAndMultiSelect={isButton}
        cardConfig={cardConfig}
        key={`AttributionCard-${packageInfo.packageName}-${attributionId}`}
        cardId={`manual-${props.selectedResourceId}-${attributionId}`}
        packageInfo={packageInfo}
        showOpenResourcesIcon={!isButton}
        hideAttributionWizardContextMenuItem={props.attributionsFromParent}
      />
    );
  }

  return (
    <List
      getListItem={(index: number): ReactElement =>
        getAttributionCard(attributionIds[index])
      }
      length={attributionIds.length}
      max={{ numberOfDisplayedItems: 5 }}
      cardVerticalDistance={41}
    />
  );
}
