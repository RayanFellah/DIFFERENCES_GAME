import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DialogComponent } from '@app/components/dialogue/dialog.component';
import { ImageAreaComponent } from '@app/components/image-area/image-area.component';
import { FileValueAccessorDirective } from '@app/directives/file-value-accessor.directive';
import { BmpVerificationService } from '@app/services/bmp-verification.service';
import { DrawingService } from '@app/services/draw.service';
import { FileUploaderService } from '@app/services/file-uploader.service';
import { ImageHttpService } from '@app/services/image-http.service';
import { SheetHttpService } from '@app/services/sheet-http.service';
import { SnackBarService } from '@app/services/snack-bar.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { THREE } from 'src/constants';

@Component({
    selector: 'app-creation-page',
    templateUrl: './creation-page.component.html',
    styleUrls: ['./creation-page.component.scss'],
    providers: [DialogComponent],
})
export class CreationPageComponent implements OnInit {
    @ViewChildren(FileValueAccessorDirective) leftInput: QueryList<FileValueAccessorDirective>;
    @ViewChild('leftImageArea', { static: false }) leftImageArea: ImageAreaComponent;
    @ViewChild('rightImageArea', { static: false }) rightImageArea: ImageAreaComponent;

    radiusSizePx = THREE;
    createGame: FormGroup;
    shouldNavigate$ = new BehaviorSubject(false);
    numberofDifferences: number = 0;
    mergedFiles: File;
    fileUploadSubscription: Subscription;
    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly fileUploaderService: FileUploaderService,
        private readonly bmpVerificationService: BmpVerificationService,
        private readonly snackBar: SnackBarService,
        private readonly http: SheetHttpService,
        private readonly httpImage: ImageHttpService,
        private router: Router,
        private dialog: DialogComponent,
    ) {
        this.shouldNavigate$.subscribe((shouldNavigate) => {
            if (shouldNavigate) {
                this.router.navigate(['/config']);
            }
        });
    }

    get title() {
        return this.createGame.get('title');
    }
    get originalImagePath() {
        return this.createGame.get('originalImagePath');
    }
    get modifiedImagePath() {
        return this.createGame.get('modifiedImagePath');
    }
    get radiusSize() {
        return this.createGame.get('radiusSize');
    }
    navigate() {
        this.shouldNavigate$.next(true);
    }
    ngOnInit() {
        this.createGameForm();

        this.originalImagePath?.valueChanges.subscribe((value) => {
            this.fileUploaderService.setCanvasImage(value, 'left');
        });
        this.modifiedImagePath?.valueChanges.subscribe((value) => {
            this.fileUploaderService.setCanvasImage(value, 'right');
        });
        this.fileUploaderService.getMergedCanvas('left').subscribe((value) => {
            this.createGame.patchValue({
                originalImagePath: value,
            });
        });
        this.fileUploaderService.getMergedCanvas('right').subscribe((value) => {
            this.createGame.patchValue({
                modifiedImagePath: value,
            });
        });
    }

    createGameForm(): void {
        this.createGame = this.formBuilder.group({
            title: ['', Validators.required],
            originalImagePath: [null, Validators.required],
            modifiedImagePath: [null, Validators.required],
            radiusSize: [THREE, Validators.required],
        });
    }
    onFileChange(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.files != null && target.files.length > 0) {
            const file = target.files[0];
            if (this.bmpVerificationService.verifyImage(file)) {
                // Set both originalImagePath and modifiedImagePath to the selected file
                this.createGame.patchValue({
                    originalImagePath: file,
                    modifiedImagePath: file,
                });
            } else {
                this.snackBar.openSnackBar("L'image n'est pas 640 x 480px ou de format 24-bit bmp.", 'Fermer');
            }
        }
    }

    verifyDifferences() {
        if (this.originalImagePath?.value && this.modifiedImagePath?.value) {
            const formData = new FormData();
            formData.append('originalImagePath', this.originalImagePath?.value);
            formData.append('modifiedImagePath', this.modifiedImagePath?.value);
            formData.append('radius', this.radiusSize?.value);

            this.httpImage
                .getDifferences(formData)
                .subscribe((res: HttpResponse<{ body: { differences: number; imageBase64: string } } | object>) => {
                    if (res.status === HttpStatusCode.Ok) {
                        const body = res.body as { differences: number; imageBase64: string };
                        this.numberofDifferences = body.differences;
                        this.dialog.openImageDialog(body.imageBase64);
                        this.snackBar.openSnackBar(`Il y a ${body.differences} différences`, 'Fermer');
                    } else {
                        this.snackBar.openSnackBar(`Une erreur est survenue ${res.body} `, 'Fermer');
                    }
                });
        } else {
            this.originalImagePath?.markAsTouched();
            this.modifiedImagePath?.markAsTouched();
        }
    }

    submit() {
        if (this.createGame.valid) {
            const formData = new FormData();
            formData.append('title', this.title?.value);
            formData.append('originalImagePath', this.originalImagePath?.value);
            formData.append('modifiedImagePath', this.modifiedImagePath?.value);
            formData.append('radius', this.radiusSize?.value);
            this.http.createSheet(formData).subscribe(
                (next?) => {
                    this.dialog.openImageDialog(next.image);
                    this.createGame.reset();
                    this.navigate();
                    // Handle success
                },
                (error?) => {
                    this.snackBar.openSnackBar(`${error.error} `, 'Fermer');
                    // Handle error
                },
            );
        } else {
            // mark all controls as touched to show errors
            this.createGame.markAllAsTouched();
        }
    }
    duplicate(image1: ImageAreaComponent, image2: ImageAreaComponent) {
        DrawingService.duplicate(image1.fCanvas.nativeElement, image2.fCanvas.nativeElement);
    }
    switch(image1: ImageAreaComponent, image2: ImageAreaComponent) {
        DrawingService.switch(image1.fCanvas.nativeElement, image2.fCanvas.nativeElement);
    }
}
