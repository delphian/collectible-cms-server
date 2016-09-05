import { Component, Input, Output, ViewChild, OnInit, EventEmitter } from '@angular/core';
import { DomSanitizationService } from '@angular/platform-browser';
import { Collectible } from '../../../models/collectible';
import { User, CurrentUser } from '../../../models/user';
import { File } from '../../../models/file';
import { AlertMessage } from '../../../models/alertMessage';
import { CollectibleService } from '../../../services/collectible/collectible.service';
import { AuthenticateService } from '../../../services/authenticate/authenticate.service';
import { Options as TableOptions } from '../../../components/files/views/images/table/table.component'
import { Options as ImgThumbOptions } from '../../../components/files/views/images/thumbnail/thumbnail.component';
import { Options as ThumbnailOptions } from '../../../components/files/views/images/thumbnail/thumbnail.component';

/**
 *  <cc-collectible-create
 *      [options]="collectibleOptions"
 *      (onAlert)="doAlert($event)">
 *  </cc-collectible-create>
 */
@Component({
    moduleId: module.id,
    selector: 'cc-collectible-create',
    templateUrl: 'create.html',
    styleUrls: ['create.css'],
    providers: [
        CollectibleService
    ],
    directives: [
    ]
})
export class CollectibleCreate implements OnInit {
    @Input() options: Options;
    @Output() onAlert = new EventEmitter<AlertMessage>();
    working: boolean = false;
    loaded: boolean = false;
    success: boolean = false;
    collectible: Collectible = new Collectible();
    currentUser: CurrentUser;
    files: File[] = [];
    tableOptions: TableOptions = {
        rows: 1,
        pagination: {
            pageCurrent: 1,
            maxPageButtons: 1,
            itemsPerPage: 1
        },
        thumbnail: {
            width: "6em;",
            height: "6em;"
        }
    };
    constructor(private authService: AuthenticateService, private collectibleService: CollectibleService) { }
    ngOnInit() {
        this.loaded = true;
        this.currentUser = this.authService.getCurrentUser();
    }
    // Event listener for child component.
    doAlert(alert: AlertMessage) {
        this.onAlert.emit(alert);
    }
    // Event listener for child component.
    doFileUpload(file: File) {
        if (this.collectible.fileIds === undefined) {
            this.collectible.fileIds = [];
        }
        this.files.push(file);
        this.collectible.fileIds.push(file._id);
    }
    save() {
        this.working = true;
        this.collectibleService.create(this.currentUser.user, this.collectible).subscribe(
            collectible => { 
                this.collectible = collectible; 
                this.success = true;
                var self = this;
                setTimeout(function() {
                    self.success = false;
                    self.collectible = new Collectible();
                }, 2000);
            },
            err => { this.onAlert.emit({ type: 'error', message: err }); },
            () => { this.working = false; }
        );
    }
};
// Support class.
export class Options {

}
