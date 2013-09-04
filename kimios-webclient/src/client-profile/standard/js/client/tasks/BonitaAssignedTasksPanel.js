/*
 * Kimios - Document Management System Software
 * Copyright (C) 2012-2013  DevLib'
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 2 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
kimios.tasks.BonitaAssignedTasksPanel = Ext.extend(Ext.grid.GridPanel, {

    constructor: function (config) {
        this.tasksCounter = 0;
        this.id = 'kimios-assigned-tasks-panel';
        this.title = kimios.lang('BonitaAssignedTasks');
//        this.iconCls = 'tasks';
        this.hideHeaders = true;
        this.stripeRows = true;
        this.store = kimios.store.TasksStore.getBonitaAssignedTasksStore(false);
        this.viewConfig = {
            forceFit: true,
            scrollOffset: 0
        };
        this.columnLines = false;
        this.sm = new Ext.grid.RowSelectionModel({singleSelect: true});
        this.cm = new Ext.grid.ColumnModel([

            {
                sortable: false,
                menuDisabled: true,
                align: 'left',
                flex: 1,
                dataIndex: 'name',
                renderer: function (value, meta, record) {
                    var state = record.data.state;
                    var date = kimios.date(record.data.expectedEndDate);

                    var html = '';

                    if (state == 'failed') {
                        html = '<span style="color:red;">' + value;
                        html += '<br/><span style="font-size:10px;">' + date + '</span></span>';
                    } else {
                        html = value;
                        html += '<br/><span style="font-size:10px;color:#666;">' + date + '</span>';
                    }

                    return html;
                }
            }  ,
            {
                align: 'center',
                readOnly: true,
                width: 16,
                hidden: false,
                sortable: false,
                hideable: false,
                fixed: true,
                resizable: false,
                menuDisabled: true,
                renderer: function (val, metaData, record, rowIndex, colIndex, store) {
                    if (record.data.state == 'failed') {
                        metaData.css = 'reject-status';
                    }

                }
            },
            {
                readOnly: true,
                width: 32,
                sortable: false,
                hideable: false,
                fixed: true,
                resizable: false,
                menuDisabled: true
            }

        ]);

        kimios.tasks.BonitaAssignedTasksPanel.superclass.constructor.call(this, config);
    },

    initComponent: function () {
        kimios.tasks.BonitaAssignedTasksPanel.superclass.initComponent.apply(this, arguments);

        this.store.on('load', function (store, records, options) {
            this.tasksCounter = records.length;
            var newTitle = kimios.lang('BonitaAssignedTasks') + ' ' + (this.tasksCounter > 0 ? '(' + this.tasksCounter + ')' : '');
            var tasksButton = kimios.explorer.getToolbar().myAssignedTasksButton;
            this.setTitle(newTitle);
            tasksButton.setText(newTitle);
            this.setIconClass(null);
            tasksButton.setIconClass('tasks');
            if (this.lastSelectedRow != undefined)
                this.getSelectionModel().selectRow(this.lastSelectedRow);
            kimios.explorer.getToolbar().doLayout(); // My Tasks button GUI fix
        }, this);

        this.on('rowdblclick', function (grid, rowIndex, e) {
            var pojo = grid.getSelectionModel().getSelected().data;
            this.getTaskWindow(pojo).show();
        }, this);

        this.on('rowcontextmenu', function (grid, rowIndex, e) {
            e.preventDefault();
            var sm = this.getSelectionModel();
            sm.selectRow(rowIndex);
            var selectedRecord = sm.getSelected();
            kimios.ContextMenu.show(selectedRecord.data, e, 'myBonitaAssignedTasks');
        });

        this.on('containercontextmenu', function (grid, e) {
            e.preventDefault();
            kimios.ContextMenu.show(new kimios.DMEntityPojo({}), e, 'myBonitaAssignedTasksContainer');
        }, this);
    },

    refresh: function () {
        this.setIconClass('loading');
        kimios.explorer.getToolbar().myAssignedTasksButton.setIconClass('loading');
        this.store.reload({
            scope: this,
            callback: function (records) {
//                if (!records || records.length == 0) {
//                    this.store.insert(0, new Ext.data.Record({
//                        name: kimios.lang('NoTasks'),
//                        type: 9,
//                        extension: null
//                    }));
//                }
            }
        });
    },

    refreshLanguage: function () {
        var newTitle = kimios.lang('BonitaAssignedTasks') + ' ' + (this.tasksCounter > 0 ? '(' + this.tasksCounter + ')' : '');
        this.setTitle(newTitle);
        kimios.explorer.getToolbar().myAssignedTasksButton.setText(newTitle);
        this.refresh();
        this.doLayout();
    },

    getTaskWindow: function (myTask) {
        var task = null;
        var process = null;

        if (myTask == undefined) {
            task = this.dmEntityPojo;
            process = this.dmEntityPojo.processWrapper;
        } else {
            task = myTask;
            process = myTask.processWrapper;
        }

        /* task fields */

        this.appsField = new Ext.form.DisplayField({
            name: 'apps',
            anchor: '100%',
            fieldLabel: 'Apps',
            value: process.name
        });

        this.versionField = new Ext.form.DisplayField({
            name: 'apps',
            anchor: '100%',
            fieldLabel: 'Apps version',
            value: process.version
        });

        this.caseField = new Ext.form.DisplayField({
            name: 'apps',
            anchor: '100%',
            fieldLabel: 'Case',
            value: task.rootContainerId
        });

        this.stateField = new Ext.form.DisplayField({
            name: 'apps',
            anchor: '100%',
            fieldLabel: 'State',
            value: task.state
        });

        this.priorityField = new Ext.form.DisplayField({
            anchor: '100%',
            fieldLabel: 'Priority',
            value: task.priority
        });

        this.expectedEndDateField = new Ext.form.DisplayField({
            anchor: '100%',
            fieldLabel: 'Due date',
            value: kimios.date(task.expectedEndDate)
        });

        this.lastUpdateDateField = new Ext.form.DisplayField({
            anchor: '100%',
            fieldLabel: 'Last update date',
            value: kimios.date(task.lastUpdateDate)
        });

        this.claimedField = new Ext.form.DisplayField({
            anchor: '100%',
            fieldLabel: 'Claimed date',
            value: kimios.date(task.claimedDate)
        });

        this.reachedStateField = new Ext.form.DisplayField({
            anchor: '100%',
            fieldLabel: 'Reached state date',
            value: kimios.date(task.reachedStateDate)
        });

        this.descriptionField = new Ext.form.DisplayField({
            anchor: '100%',
            fieldLabel: 'Description',
            value: task.description ? task.description : 'No description'
        });

        return new Ext.Window({
            id: 'BonitaAssignedTaskWindowID',
            width: 500,
            height: 485,
            layout: 'fit',
            border: false,
            title: task.name,
            iconCls: 'accept-status',
            maximizable: true,
            modal: true,
            autoScroll: true,
            items: [
                new kimios.FormPanel({
                    bodyStyle: 'padding:10px;background-color:transparent;',
                    labelWidth: 200,
                    autoScroll: true,
                    defaults: {
                        style: 'font-size: 11px',
                        labelStyle: 'font-size: 11px;font-weight:bold;'
                    },
                    items: [
                        new Ext.form.FieldSet({
                            title: 'Task Details',
                            layout: 'form',
                            collapsible: false,
                            defaults: {
                                style: 'font-size: 11px',
                                labelStyle: 'font-size: 11px;font-weight:bold;'
                            },
                            bodyStyle: 'padding:3px;background-color:transparent;',
                            items: [
                                this.appsField,
                                this.versionField,
                                this.caseField,
                                this.stateField,
                                this.priorityField
                            ]
                        }),
                        new Ext.form.FieldSet({
                            title: 'Task Dates',
                            layout: 'form',
                            collapsible: false,
                            defaults: {
                                style: 'font-size: 11px',
                                labelStyle: 'font-size: 11px;font-weight:bold;'
                            },
                            bodyStyle: 'padding:3px;background-color:transparent;',
                            items: [
                                this.expectedEndDateField,
                                this.lastUpdateDateField,
                                this.claimedField,
                                this.reachedStateField
                            ]
                        }),
                        new Ext.form.FieldSet({
                            title: 'Others',
                            layout: 'form',
                            collapsible: false,
                            defaults: {
                                style: 'font-size: 11px',
                                labelStyle: 'font-size: 11px;font-weight:bold;'
                            },
                            bodyStyle: 'padding:3px;background-color:transparent;',
                            items: [
                                this.descriptionField
                            ]
                        })
                    ]
                })
            ],
            fbar: [
                {
                    text: kimios.lang('BonitaDoIt'),
                    iconCls: 'studio-cls-wf',
                    handler: function () {
                        Ext.getCmp('BonitaAssignedTaskWindowID').close();

                        var url = task.url;

                        var iframe = new Ext.Window({
                            width: 640,
                            height: 480,
                            layout: 'fit',
                            border: false,
                            title: kimios.lang('WorkflowStatus'),
                            maximizable: true,
                            closable: false,
                            modal: true,
                            autoScroll: true,
                            items: [
                                {
                                    html: '<iframe id="reportframe" border="0" width="100%" height="100%" ' +
                                        'frameborder="0" marginheight="12" marginwidth="16" scrolling="auto" ' +
                                        'style="padding: 16px" ' +
                                        'src="' + url + '"></iframe>'
                                }
                            ],
                            fbar: [
                                {
                                    text: kimios.lang('Close'),
                                    handler: function () {
                                        iframe.close();
                                        Ext.getCmp('kimios-tasks-panel').refresh();
                                        Ext.getCmp('kimios-assigned-tasks-panel').refresh();
                                    }
                                }
                            ]
                        }).show();
                    }
                },

                {
                    text: kimios.lang('BonitaRelease'),
                    iconCls: 'studio-wf-expand',
                    handler: function () {
                        kimios.ajaxRequest('Workflow', {
                                action: 'releaseTask',
                                taskId: task.id
                            },
                            function () {
                                Ext.getCmp('kimios-tasks-panel').refresh();
                                Ext.getCmp('kimios-assigned-tasks-panel').refresh();
                            }
                        );
                        Ext.getCmp('BonitaAssignedTaskWindowID').close();
                    }
                },
                {
                    text: kimios.lang('BonitaHide'),
                    iconCls: 'delete',
                    handler: function () {
                        kimios.ajaxRequest('Workflow', {
                                action: 'hideTask',
                                taskId: task.id
                            },
                            function () {
                                Ext.getCmp('kimios-tasks-panel').refresh();
                                Ext.getCmp('kimios-assigned-tasks-panel').refresh();
                            }
                        );
                        Ext.getCmp('BonitaAssignedTaskWindowID').close();
                    }
                },
                {
                    text: kimios.lang('Close'),
                    handler: function () {
                        Ext.getCmp('BonitaAssignedTaskWindowID').close();
                    }
                }
            ]
        });
    }
});