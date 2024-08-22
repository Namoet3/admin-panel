import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { UserService } from '../services/user.service';
import {ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'app-user-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  templateUrl: './user-detail-dialog.component.html',
  styleUrls: ['./user-detail-dialog.component.scss'],
})
export class UserDetailDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<UserDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService
  ) {
    console.log(data);
  }

  ngOnInit(): void {
    console.log('Received data:', this.data);

    // this.userService.getUser(this.data.userId).subscribe(userData => {
    //   this.data = userData;
    //   if (!this.data.userDetails) {
    //     console.warn('No userDetails found in the data!');
    //   }
    // });
  }

  getDownloadLink(userId: number, fileName: string): string {
    return `https://localhost:5231/api/user/download/${encodeURIComponent(fileName)}`;
  }
  

  onClose(): void {
    this.dialogRef.close();
  }
}
