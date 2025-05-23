import { Divider, Grid, List, Paper, Tab, Tabs, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Fragment, type SyntheticEvent, useContext, useEffect, useMemo, useState } from 'react';
import { makeStyles } from 'tss-react/mui';

import { searchTargets } from '../../../../actions/injects/inject-action';
import PaginationComponentV2 from '../../../../components/common/queryable/pagination/PaginationComponentV2';
import { buildSearchPagination } from '../../../../components/common/queryable/QueryableUtils';
import { useQueryable } from '../../../../components/common/queryable/useQueryableWithLocalStorage';
import Empty from '../../../../components/Empty';
import { useFormatter } from '../../../../components/i18n';
import Loader from '../../../../components/Loader';
import SearchFilter from '../../../../components/SearchFilter';
import { type InjectTarget, type InjectTargetWithResult } from '../../../../utils/api-types';
import useSearchAnFilter from '../../../../utils/SortingFiltering';
import { isFeatureEnabled } from '../../../../utils/utils';
import { InjectResultOverviewOutputContext, type InjectResultOverviewOutputContextType } from '../InjectResultOverviewOutputContext';
import NewTargetListItem from './NewTargetListItem';
import TargetListItem from './TargetListItem';
import TargetResultsDetail from './TargetResultsDetail';

const useStyles = makeStyles()({
  chip: {
    fontSize: 12,
    height: 25,
    margin: '0 7px 7px 0',
    textTransform: 'uppercase',
    borderRadius: 4,
    width: 180,
  },
  paper: {
    height: '100%',
    minHeight: '100%',
    padding: 15,
    borderRadius: 4,
  },
  dividerL: {
    position: 'absolute',
    backgroundColor: 'rgba(105, 103, 103, 0.45)',
    width: '2px',
    bottom: '0',
    height: '99%',
    left: '-10px',
  },
  tabs: { marginLeft: 'auto' },
});

const AtomicTesting = () => {
  // Standard hooks
  const { classes } = useStyles();
  const theme = useTheme();
  const { t } = useFormatter();
  const [selectedTargetLegacy, setSelectedTargetLegacy] = useState<InjectTargetWithResult>();
  const [selectedTarget, setSelectedTarget] = useState<InjectTarget>();
  const [targets, setTargets] = useState<InjectTarget[]>();
  const [currentParentTarget, setCurrentParentTarget] = useState<InjectTargetWithResult>();
  const [upperParentTarget, setUpperParentTarget] = useState<InjectTargetWithResult>();
  const filtering = useSearchAnFilter('', 'name', ['name']);
  const [activeTab, setActiveTab] = useState(0);

  // Fetching data
  const { injectResultOverviewOutput } = useContext<InjectResultOverviewOutputContextType>(InjectResultOverviewOutputContext);

  const sortedTargets: InjectTargetWithResult[] = filtering.filterAndSort(injectResultOverviewOutput?.inject_targets ?? []);

  const [hasAssetsGroup, setHasAssetsGroup] = useState(false);
  const [hasAssetsGroupChecked, setHasAssetsGroupChecked] = useState(false);
  const [hasTeams, setHasTeams] = useState(false);
  const [hasTeamsChecked, setHasTeamsChecked] = useState(false);

  const paginationEnabled = isFeatureEnabled('TARGET_PAGINATION');

  const tabConfig = useMemo(() => {
    let index = 0;
    const tabs = [];

    // enable these tabs only when the TARGET_PAGINATION
    // preview feature is set.
    if (paginationEnabled) {
      if (hasAssetsGroup) {
        tabs.push({
          key: index++,
          label: t('Asset groups'),
          type: 'ASSETS_GROUPS',
          entityPrefix: 'asset_group_target',
        });
      }
      if (hasTeams) {
        tabs.push({
          key: index++,
          label: t('Teams'),
          type: 'TEAMS',
          entityPrefix: 'team_target',
        });
      }
    }

    tabs.push({
      key: index++,
      label: t('All targets'),
      type: 'ALL_TARGETS',
    });

    return tabs;
  }, [hasAssetsGroup, hasTeams]);

  const { queryableHelpers, searchPaginationInput, setSearchPaginationInput } = useQueryable(buildSearchPagination({
    filterGroup: {
      mode: 'and',
      filters: [],
    },
  }));

  const injectId = injectResultOverviewOutput?.inject_id || '';

  useEffect(() => {
    if (!injectResultOverviewOutput) return;

    setSearchPaginationInput({
      filterGroup: {
        mode: 'and',
        filters: [],
      },
      page: 0,
      size: 20,
    });

    setSelectedTargetLegacy(
      selectedTargetLegacy
      || currentParentTarget
      || injectResultOverviewOutput?.inject_targets?.[0],
    );

    const searchPaginationInput1Result = {
      ...searchPaginationInput,
      size: 1,
    };

    searchTargets(injectId, 'ASSETS_GROUPS', searchPaginationInput1Result)
      .then((response) => {
        if (response.data.content.length > 0) {
          setHasAssetsGroup(true);
        } else { setHasAssetsGroup(false); }
      })
      .finally(() => {
        setHasAssetsGroupChecked(true);
      });
    searchTargets(injectId, 'TEAMS', searchPaginationInput1Result)
      .then((response) => {
        if (response.data.content.length > 0) {
          setHasTeams(true);
        } else { setHasTeams(false); }
      })
      .finally(() => {
        setHasTeamsChecked(true);
      });
  }, [injectResultOverviewOutput]);

  // Handles

  const handleTargetClick = (target: InjectTargetWithResult, currentParent?: InjectTargetWithResult, upperParentTarget?: InjectTargetWithResult) => {
    setSelectedTargetLegacy(target);
    setCurrentParentTarget(currentParent);
    setUpperParentTarget(upperParentTarget);
  };

  const handleNewTargetClick = (target: InjectTarget) => {
    // TODO: handle the platform type for Endpoint targets
    setSelectedTargetLegacy({
      id: target.target_id,
      name: target.target_name,
      targetType: target.target_type,
      platformType: undefined,
    });
    setSelectedTarget(target);
  };

  const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const renderTargetItem = (target: InjectTargetWithResult, parent: InjectTargetWithResult | undefined, upperParent: InjectTargetWithResult | undefined) => {
    return (
      <>
        <TargetListItem
          onClick={() => handleTargetClick(target, parent, upperParent)}
          target={target}
          selected={selectedTargetLegacy?.id === target.id && currentParentTarget?.id === parent?.id && upperParentTarget?.id === upperParent?.id}
        />
        {target?.children && target.children.length > 0 && (
          <List disablePadding style={{ marginLeft: theme.spacing(2) }}>
            {target.children.map(child => (
              <Fragment key={child?.id}>
                {renderTargetItem(child, target, parent)}
              </Fragment>
            ))}
            <Divider className={classes.dividerL} />
          </List>
        )}
      </>
    );
  };

  if (!injectResultOverviewOutput) {
    return <Loader variant="inElement" />;
  }

  return (
    <Grid container spacing={3} style={{ marginBottom: theme.spacing(3) }}>
      <Grid size={6}>
        <Typography variant="h4" gutterBottom style={{ float: 'left' }} sx={{ mb: theme.spacing(1) }}>
          {t('Targets')}
        </Typography>
        <div className="clearfix" />
        <Paper classes={{ root: classes.paper }} variant="outlined">
          {hasAssetsGroupChecked && hasTeamsChecked && (
            <>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                className={classes.tabs}
              >
                {tabConfig
                  .map(tab => (
                    <Tab key={`tab-${tab.key}`} label={tab.label} />
                  ))}
              </Tabs>
              {tabConfig
                .map((tab) => {
                  const isAllTargets = tab.type === 'ALL_TARGETS';
                  return (
                    <div key={`tab-${tab.key}`} hidden={activeTab !== tab.key}>
                      {!isAllTargets && (
                        <>
                          <PaginationComponentV2
                            fetch={input => searchTargets(injectResultOverviewOutput?.inject_id, tab.type, input)}
                            searchPaginationInput={searchPaginationInput}
                            setContent={setTargets}
                            entityPrefix={tab.entityPrefix}
                            queryableHelpers={queryableHelpers}
                            topPagination={true}
                          />
                          {targets && targets.length > 0 ? (
                            <List>
                              {targets.map(target => (
                                <NewTargetListItem
                                  onClick={() => handleNewTargetClick(target)}
                                  target={target}
                                  selected={selectedTarget?.target_id === target.target_id}
                                  key={target?.target_id}
                                />
                              ))}
                            </List>
                          ) : (
                            <Empty message={t('No target configured.')} />
                          )}
                        </>
                      )}

                      {isAllTargets && (
                        <>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'end',
                          }}
                          >
                            <SearchFilter
                              onChange={filtering.handleSearch}
                              keyword={filtering.keyword}
                              placeholder={t('Search by target name')}
                              variant="thin"
                            />
                          </div>
                          {sortedTargets.length > 0 ? (
                            <List>
                              {sortedTargets.map(target => (
                                <div key={target?.id}>
                                  {renderTargetItem(target, undefined, undefined)}
                                </div>
                              ))}
                            </List>
                          ) : (
                            <Empty message={t('No target configured.')} />
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
            </>
          )}
        </Paper>
      </Grid>
      <Grid size={6}>
        <Typography variant="h4" gutterBottom sx={{ mb: theme.spacing(1) }}>
          {t('Results by target')}
        </Typography>
        <Paper classes={{ root: classes.paper }} variant="outlined">
          {selectedTargetLegacy && !!injectResultOverviewOutput.inject_type && (
            <TargetResultsDetail
              inject={injectResultOverviewOutput}
              upperParentTargetId={upperParentTarget?.id}
              parentTargetId={currentParentTarget?.id}
              target={selectedTargetLegacy}
              lastExecutionStartDate={injectResultOverviewOutput.inject_status?.tracking_sent_date || ''}
              lastExecutionEndDate={injectResultOverviewOutput.inject_status?.tracking_end_date || ''}
            />
          )}
          {!selectedTargetLegacy && (
            <Empty message={t('No target data available.')} />
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default AtomicTesting;
