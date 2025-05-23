import { Chip, Tooltip } from '@mui/material';
import * as R from 'ramda';
import { type FunctionComponent, useEffect, useRef, useState } from 'react';

import { type Filter, type PropertySchemaDTO } from '../../../../utils/api-types';
import FilterChipPopover from './FilterChipPopover';
import FilterChipValues from './FilterChipValues';
import { type FilterHelpers } from './FilterHelpers';

interface Props {
  filter: Filter;
  helpers: FilterHelpers;
  propertySchema: PropertySchemaDTO;
  pristine: boolean;
  contextId?: string;
}

const FilterChip: FunctionComponent<Props> = ({
  filter,
  helpers,
  propertySchema,
  pristine,
  contextId,
}) => {
  const chipRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(!pristine);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleRemoveFilter = () => {
    if (helpers) {
      helpers.handleRemoveFilterByKey(filter.key);
    }
  };

  const isEmpty = (values?: string[]) => {
    return R.isEmpty(values) || values?.some(v => R.isEmpty(v));
  };

  const chipVariant = isEmpty(filter.values) && !['empty', 'not_empty'].includes(filter.operator ?? 'eq')
    ? 'outlined'
    : 'filled';

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (chipRef.current) {
      setAnchorEl(chipRef.current);
    }
  }, [chipRef.current]);

  return (
    <>
      <Tooltip
        title={(
          <FilterChipValues
            filter={filter}
            propertySchema={propertySchema}
            isTooltip
            handleOpen={handleOpen}
          />
        )}
      >
        <Chip
          variant={chipVariant}
          label={(
            <FilterChipValues
              filter={filter}
              propertySchema={propertySchema}
              handleOpen={handleOpen}
            />
          )}
          onDelete={handleRemoveFilter}
          sx={{ borderRadius: 1 }}
          ref={chipRef}
        />
      </Tooltip>
      {anchorEl
        && (
          <FilterChipPopover
            filter={filter}
            helpers={helpers}
            open={open}
            onClose={handleClose}
            anchorEl={chipRef.current!}
            propertySchema={propertySchema}
            contextId={contextId}
          />
        )}
    </>
  );
};
export default FilterChip;
